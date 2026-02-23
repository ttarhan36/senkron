
import React, { useState, useEffect } from 'react';
import {
  ExamPackage, ExamType, ExamSession, ExamQuestion,
  StudentResponse, SubjectSummary, CompensationAlert,
  TrafficLightStatus, SessionType
} from '../types';
import { UserSession } from '../types';
import { buildSubjectSummaries, generateCompensationAlerts, getPercentileProjection } from '../utils';
import { supabase } from '../services/supabaseClient';

interface Props {
  session: UserSession;
}

type View = 'LIST' | 'ANSWER_FORM' | 'RESULT';

const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  LGS: 'LGS', TYT: 'TYT', AYT: 'AYT', YDT: 'YDT', TARAMA_11: 'TARAMA'
};

const CHOICES = ['A', 'B', 'C', 'D', 'E'];

const TRAFFIC_COLORS: Record<TrafficLightStatus, { bg: string; dot: string; text: string; label: string }> = {
  RED: { bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-500', text: 'text-red-400', label: 'ACİL' },
  YELLOW: { bg: 'bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-400', text: 'text-yellow-400', label: 'DİKKAT' },
  GREEN: { bg: 'bg-green-500/10 border-green-500/20', dot: 'bg-green-500', text: 'text-green-400', label: 'TAMAM' }
};

const StudentExamView: React.FC<Props> = ({ session }) => {
  const [view, setView] = useState<View>('LIST');
  const [exams, setExams] = useState<ExamPackage[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamPackage | null>(null);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [activeSessionIdx, setActiveSessionIdx] = useState(0);
  const [questions, setQuestions] = useState<Record<string, ExamQuestion[]>>({}); // sessionId → questions
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId → answer
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ summaries: SubjectSummary[]; alerts: CompensationAlert[]; percentile: { year: number; percentile: number } | null } | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Load exams for student's class
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const studentClassId = (session as any).classId ?? null;

      let query = supabase
        .from('exams')
        .select('*, exam_sessions(*)')
        .eq('school_id', session.schoolId)
        .eq('status', 'DONE')
        .order('created_at', { ascending: false });

      const { data, error: e } = await query;

      if (!e && data) {
        const filtered = data.filter((row: any) => {
          if (!row.class_ids || row.class_ids.length === 0) return true;
          return studentClassId ? row.class_ids.includes(studentClassId) : false;
        });

        setExams(filtered.map((row: any) => ({
          id: row.id, schoolId: row.school_id, name: row.name,
          examType: row.exam_type as ExamType, targetGrade: row.target_grade,
          appliedDate: row.applied_date, wrongPenaltyRatio: parseFloat(row.wrong_penalty_ratio),
          status: row.status, classIds: row.class_ids ?? [],
          sessions: (row.exam_sessions ?? [])
            .sort((a: any, b: any) => a.session_order - b.session_order)
            .map((s: any) => ({
              id: s.id, examId: s.exam_id, sessionName: s.session_name as SessionType,
              durationMinutes: s.duration_minutes, questionCount: s.question_count,
              sessionOrder: s.session_order, questions: []
            }))
        })));
      }
      setLoading(false);
    };
    fetch();
  }, [session.schoolId]);

  const loadExamQuestions = async (exam: ExamPackage) => {
    const sessionsData = exam.sessions ?? [];
    const qMap: Record<string, ExamQuestion[]> = {};

    await Promise.all(sessionsData.map(async s => {
      const { data } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('session_id', s.id)
        .order('question_number');

      qMap[s.id] = (data ?? []).map((q: any) => ({
        id: q.id, sessionId: q.session_id, questionNumber: q.question_number,
        subject: q.subject, correctAnswer: q.correct_answer,
        pointWeight: parseFloat(q.point_weight ?? 1),
        aiAnalysisStatus: q.ai_analysis_status, questionText: q.question_text
      }));
    }));

    return qMap;
  };

  const checkPreviousSubmission = async (examId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('student_responses')
      .select('id')
      .eq('student_id', session.id)
      .limit(1);
    return (data ?? []).length > 0;
  };

  const handleOpenExam = async (exam: ExamPackage) => {
    setLoading(true);
    setError(null);
    const [qMap, submitted] = await Promise.all([
      loadExamQuestions(exam),
      checkPreviousSubmission(exam.id)
    ]);

    setSelectedExam(exam);
    setSessions(exam.sessions ?? []);
    setQuestions(qMap);
    setAnswers({});
    setActiveSessionIdx(0);
    setAlreadySubmitted(submitted);

    if (submitted) {
      await loadAndShowResult(exam, qMap);
      setView('RESULT');
    } else {
      setView('ANSWER_FORM');
    }
    setLoading(false);
  };

  const loadAndShowResult = async (exam: ExamPackage, qMap: Record<string, ExamQuestion[]>) => {
    const { data: responses } = await supabase
      .from('student_responses')
      .select('*')
      .eq('student_id', session.id);

    const responseList: StudentResponse[] = (responses ?? []).map((r: any) => ({
      id: r.id, studentId: r.student_id, questionId: r.question_id,
      givenAnswer: r.given_answer, isCorrect: r.is_correct,
      isEmpty: r.is_empty, rawScore: r.raw_score, lostPoints: r.lost_points
    }));

    const allSessions = exam.sessions ?? [];
    const allSummaries = allSessions.flatMap(s =>
      buildSubjectSummaries(responseList, qMap[s.id] ?? [], exam.examType, s.sessionName)
    );
    const alerts = generateCompensationAlerts(allSummaries, null, exam.examType);
    const totalNet = allSummaries.reduce((a, s) => a + s.net, 0);
    const percentile = getPercentileProjection(totalNet, exam.examType);

    setResult({ summaries: allSummaries, alerts, percentile });
  };

  const handleSetAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: prev[questionId] === answer ? '' : answer }));
  };

  const handleSubmit = async () => {
    if (!selectedExam) return;
    setSubmitting(true); setError(null);

    const allQuestions = Object.values(questions).flat();
    const penalty = selectedExam.wrongPenaltyRatio;

    const toInsert = allQuestions.map(q => {
      const given = answers[q.id] ?? '';
      const isEmpty = !given;
      const isCorrect = !isEmpty && q.correctAnswer ? given === q.correctAnswer : null;
      const isWrong = !isEmpty && isCorrect === false;
      const lost = isWrong ? q.pointWeight * penalty : 0;

      return {
        student_id: session.id,
        question_id: q.id,
        given_answer: given || null,
        is_correct: isCorrect,
        is_empty: isEmpty,
        raw_score: isCorrect ? q.pointWeight : 0,
        lost_points: lost
      };
    });

    const { error: insErr } = await supabase
      .from('student_responses')
      .upsert(toInsert, { onConflict: 'student_id,question_id' });

    if (insErr) {
      setError('Yanıtlar kaydedilemedi: ' + insErr.message);
      setSubmitting(false);
      return;
    }

    await loadAndShowResult(selectedExam, questions);
    setView('RESULT');
    setSubmitting(false);
  };

  const currentSession = sessions[activeSessionIdx];
  const currentQuestions = currentSession ? (questions[currentSession.id] ?? []) : [];
  const answeredInSession = currentQuestions.filter(q => answers[q.id]).length;
  const totalAnswered = Object.values(questions).flat().filter(q => answers[q.id]).length;
  const totalQuestions = Object.values(questions).flat().length;

  // RESULT VIEW
  if (view === 'RESULT' && selectedExam && result) {
    const totalNet = result.summaries.reduce((a, s) => a + s.net, 0);
    const totalLost = result.summaries.reduce((a, s) => a + s.lostPoints, 0);

    return (
      <div className="p-3 md:p-5 max-w-2xl mx-auto">
        <button
          onClick={() => { setView('LIST'); setResult(null); }}
          className="flex items-center gap-2 mb-4 px-3 py-1.5 bg-[#1a2535] border border-[#354a5f]/60 hover:bg-[#243040] transition-all"
        >
          <span className="text-slate-200 text-[11px]">←</span>
          <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest">GERİ</span>
        </button>

        <p className="text-[13px] font-black text-white uppercase tracking-[0.2em] mb-1">{selectedExam.name}</p>
        <p className="text-[9px] text-slate-400 mb-4 uppercase tracking-widest">ANALİZ RAPORU</p>

        {/* Metrik kartlar */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-[#0d141b]/80 border border-[#354a5f]/30 p-3">
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">TOPLAM NET</p>
            <p className="text-[22px] font-black text-white font-mono">{totalNet.toFixed(2)}</p>
          </div>
          <div className="bg-[#0d141b]/80 border border-red-500/20 p-3">
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">KAYIP PUAN</p>
            <p className="text-[22px] font-black text-red-400 font-mono">-{totalLost.toFixed(2)}</p>
          </div>
          {result.percentile ? (
            <div className="bg-[#0d141b]/80 border border-blue-500/20 p-3">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">{result.percentile.year} DİLİM</p>
              <p className="text-[22px] font-black text-blue-400 font-mono">%{result.percentile.percentile.toFixed(1)}</p>
              <p className="text-[7px] text-slate-600 uppercase">yüzdelik</p>
            </div>
          ) : (
            <div className="bg-[#0d141b]/80 border border-[#354a5f]/30 p-3 flex items-center">
              <p className="text-[7px] text-slate-600 uppercase">Projeksiyon N/A</p>
            </div>
          )}
        </div>

        {/* Ders tablosu */}
        <div className="bg-[#0d141b]/60 border border-[#354a5f]/30 p-3 mb-3">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">DERS BAZLI SONUÇLAR</p>
          <div className="space-y-0">
            <div className="flex gap-2 text-[7px] text-slate-600 uppercase pb-1 border-b border-[#1a2535] mb-1">
              <span className="w-24">DERS</span>
              <span className="w-8 text-center">D</span>
              <span className="w-8 text-center">Y</span>
              <span className="w-8 text-center">B</span>
              <span className="w-12 text-right">NET</span>
              <span className="flex-1 text-right">KAYIP</span>
            </div>
            {result.summaries.map(s => {
              const pct = s.successRate;
              const textColor = pct < 40 ? 'text-red-400' : pct < 70 ? 'text-yellow-400' : 'text-green-400';
              return (
                <div key={s.subject} className="flex gap-2 text-[9px] py-1 border-b border-[#1a2535]/60 last:border-0">
                  <span className="w-24 text-slate-300 font-black uppercase truncate">{s.subject}</span>
                  <span className="w-8 text-center text-green-400 font-mono">{s.correct}</span>
                  <span className="w-8 text-center text-red-400 font-mono">{s.wrong}</span>
                  <span className="w-8 text-center text-slate-600 font-mono">{s.empty}</span>
                  <span className={`w-12 text-right font-mono font-black ${textColor}`}>{s.net.toFixed(2)}</span>
                  <span className="flex-1 text-right text-red-400/80 font-mono">-{s.lostPoints.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trafik Işığı */}
        {result.alerts.length > 0 && (
          <div className="bg-[#0d141b]/60 border border-[#354a5f]/30 p-3 mb-3">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">TRAFİK IŞIĞI · TELAFİ ÖNERİLERİ</p>
            <div className="space-y-1">
              {result.alerts.map((a, i) => {
                const c = TRAFFIC_COLORS[a.status];
                return (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2 border ${c.bg}`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot} ${a.status === 'RED' ? 'animate-pulse' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[9px] font-black ${c.text} uppercase`}>{a.subject}</p>
                      <p className="text-[8px] text-slate-500 font-mono">
                        %{a.successRate.toFixed(0)} başarı · {a.wrongCount} yanlış · -{a.lostPoints.toFixed(2)} puan kayıp
                      </p>
                    </div>
                    <span className={`text-[8px] font-black ${c.text} shrink-0`}>{c.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mikro-kayıp mesajı */}
        {result.alerts.filter(a => a.status === 'RED').length > 0 && (
          <div className="bg-[#0d141b]/60 border border-[#354a5f]/30 p-3">
            <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">AI TELAFİ MOTORU · ÖNERİ</p>
            {result.alerts.filter(a => a.status === 'RED').slice(0, 3).map((a, i) => (
              <p key={i} className="text-[9px] text-slate-300 mb-1">
                <span className="text-red-400 font-black">{a.subject}</span> konusunu geliştirirsen puanın{' '}
                <span className="text-green-400 font-black">+{a.lostPoints.toFixed(2)}</span> artabilir.
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ANSWER FORM VIEW
  if (view === 'ANSWER_FORM' && selectedExam && currentSession) {
    const hasAnswerKey = currentQuestions.some(q => q.correctAnswer);

    return (
      <div className="p-3 md:p-5 max-w-2xl mx-auto">
        <button
          onClick={() => setView('LIST')}
          className="flex items-center gap-2 mb-4 px-3 py-1.5 bg-[#1a2535] border border-[#354a5f]/60 hover:bg-[#243040] transition-all"
        >
          <span className="text-slate-200 text-[11px]">←</span>
          <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest">GERİ</span>
        </button>

        <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-[#354a5f]/40">
          <div>
            <p className="text-[13px] font-black text-white uppercase tracking-[0.2em]">{selectedExam.name}</p>
            <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-widest">
              {EXAM_TYPE_LABELS[selectedExam.examType]} · {totalAnswered}/{totalQuestions} yanıtlandı
            </p>
          </div>
          {!hasAnswerKey && (
            <span className="text-[7px] text-yellow-400 border border-yellow-400/30 px-2 py-1 uppercase">
              Cevap anahtarı bekleniyor
            </span>
          )}
        </div>

        {/* Oturum sekmeleri */}
        <div className="flex gap-1 mb-3">
          {sessions.map((s, idx) => {
            const sQuestions = questions[s.id] ?? [];
            const answered = sQuestions.filter(q => answers[q.id]).length;
            return (
              <button key={s.id}
                onClick={() => setActiveSessionIdx(idx)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider border transition-colors ${activeSessionIdx === idx ? 'bg-[#1a2535] border-[#354a5f] text-white' : 'bg-transparent border-[#354a5f]/30 text-slate-500 hover:text-slate-300'}`}>
                {s.sessionName}
                <span className={`ml-1.5 text-[7px] font-mono ${answered === sQuestions.length && sQuestions.length > 0 ? 'text-green-400' : 'text-slate-600'}`}>
                  {answered}/{sQuestions.length}
                </span>
              </button>
            );
          })}
        </div>

        {currentQuestions.length === 0 ? (
          <div className="bg-[#0d141b]/60 border border-[#354a5f]/30 p-6 text-center">
            <p className="text-[9px] text-yellow-400 uppercase tracking-widest">Bu oturum için soru yüklenmemiş.</p>
            <p className="text-[8px] text-slate-600 mt-1">Öğretmenin soruları eklemesini bekleyin.</p>
          </div>
        ) : (
          <div className="bg-[#0d141b]/60 border border-[#354a5f]/30 p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
                {currentSession.sessionName} · {currentQuestions.length} SORU
              </p>
              <p className="text-[8px] text-slate-500 font-mono">{answeredInSession}/{currentQuestions.length}</p>
            </div>

            <div className="space-y-2">
              {currentQuestions.map(q => {
                const given = answers[q.id] ?? '';
                return (
                  <div key={q.id} className="border-b border-[#1a2535] pb-2 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] text-slate-600 font-mono w-5 shrink-0">{q.questionNumber}.</span>
                      <span className="text-[8px] text-slate-500 uppercase w-20 shrink-0">{q.subject}</span>
                      {q.questionText && (
                        <span className="text-[8px] text-slate-400 truncate flex-1">{q.questionText.slice(0, 60)}</span>
                      )}
                    </div>
                    <div className="flex gap-1 ml-7">
                      {CHOICES.map(choice => (
                        <button
                          key={choice}
                          onClick={() => handleSetAnswer(q.id, choice)}
                          className={`w-7 h-7 text-[9px] font-black border transition-colors ${
                            given === choice
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-transparent border-[#354a5f]/50 text-slate-500 hover:text-white hover:border-[#354a5f]'
                          }`}
                        >
                          {choice}
                        </button>
                      ))}
                      {given && (
                        <button
                          onClick={() => handleSetAnswer(q.id, given)}
                          className="w-7 h-7 text-[8px] text-slate-600 hover:text-red-400 border border-[#354a5f]/20 hover:border-red-500/30 transition-colors"
                        >✕</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-[9px] mb-2 uppercase">{error}</p>}

        <div className="flex items-center justify-between gap-2">
          <p className="text-[8px] text-slate-500 font-mono">{totalQuestions - totalAnswered} soru boş kalacak</p>
          <button
            onClick={handleSubmit}
            disabled={submitting || totalQuestions === 0}
            className="px-6 h-9 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-black text-[9px] uppercase tracking-[0.2em] transition-colors"
          >
            {submitting ? 'GÖNDERİLİYOR...' : 'TAMAMLA VE GÖNDER'}
          </button>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="p-3 md:p-5">
      <div className="mb-4">
        <p className="text-[13px] font-black text-white uppercase tracking-[0.3em]">SINAVLARIM</p>
        <p className="text-[7px] text-slate-500 uppercase tracking-widest mt-0.5">SINIF DENEMELER · SONUÇLAR · ANALİZ</p>
      </div>

      {loading ? (
        <p className="text-[9px] uppercase tracking-widest text-slate-600 animate-pulse py-16 text-center">YÜKLENIYOR...</p>
      ) : exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-600">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1">SINAV YOK</p>
          <p className="text-[8px] uppercase tracking-wider">Sınıfınıza atanmış sınav bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {exams.map(exam => (
            <button
              key={exam.id}
              onClick={() => handleOpenExam(exam)}
              disabled={loading}
              className="w-full bg-[#0d141b]/60 hover:bg-[#0d141b] border border-[#354a5f]/30 hover:border-[#354a5f]/60 p-3 text-left transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-wider">{exam.name}</p>
                  <p className="text-[8px] text-slate-500 mt-0.5 font-mono">
                    {EXAM_TYPE_LABELS[exam.examType]} · {exam.sessions?.length ?? 0} OTURUM
                  </p>
                </div>
                <span className="shrink-0 text-[7px] font-black uppercase px-2 py-0.5 border border-blue-500/30 text-blue-400 bg-blue-500/10">
                  YANITLA
                </span>
              </div>
              {exam.appliedDate && (
                <p className="text-[7px] text-slate-600 mt-1.5 font-mono">{exam.appliedDate}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentExamView;
