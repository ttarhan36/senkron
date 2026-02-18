import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Teacher, Student } from '../types';

interface CredentialsModuleProps {
    onSuccess: (msg: string) => void;
    schoolId: string;
}

const CredentialsModule: React.FC<CredentialsModuleProps> = ({ onSuccess, schoolId }) => {
    const [activeTab, setActiveTab] = useState<'TEACHERS' | 'STUDENTS'>('TEACHERS');
    const [searchQuery, setSearchQuery] = useState('');

    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingUser, setEditingUser] = useState<any>(null);
    const [editForm, setEditForm] = useState({ username: '', password: '' });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (schoolId) fetchData();
    }, [schoolId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: tData } = await supabase.from('teachers').select('*').eq('school_id', schoolId).order('name');
            const { data: sData } = await supabase.from('students').select('*').eq('school_id', schoolId).order('name');
            if (tData) setTeachers(tData);
            if (sData) setStudents(sData);
        } catch (error) {
            console.error("Error fetching credentials:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = (user: any) => {
        setEditingUser(user);
        setEditForm({ username: user.username || '', password: user.password || '' });
        setIsEditModalOpen(true);
    };

    const handleShareWhatsapp = (user: any) => {
        if (!user.username || !user.password) {
            alert("PAYLAŞIM İÇİN KULLANICI ADI VE ŞİFRE GEREKLİ");
            return;
        }
        const url = `${window.location.origin}/?action=qrlimit&u=${user.username}&p=${user.password}&s=${schoolId}`;
        const msg = `*GİRİŞ BİLGİLERİNİZ*\n\nMerhaba ${user.name},\nSenkron sistemine giriş bilgileriniz aşağıdadır:\n\n👤 Kullanıcı Adı: *${user.username}*\n🔑 Şifre: *${user.password}*\n\n🚀 Hızlı giriş için tıklayın:\n${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleSave = async () => {
        if (!editingUser) return;
        setSaving(true);
        try {
            const trimmedUsername = editForm.username.trim();
            const newPassword = editForm.password;

            if (trimmedUsername.length < 3) throw new Error("KULLANICI ADI EN AZ 3 KARAKTER OLMALI");
            if (newPassword.length < 6) throw new Error("ŞİFRE EN AZ 6 KARAKTER OLMALI");

            const isTeacher = activeTab === 'TEACHERS';
            const currentTable = isTeacher ? 'teachers' : 'students';
            const otherTable = isTeacher ? 'students' : 'teachers';

            // Check self duplicate
            const { data: duplicateSelf } = await supabase
                .from(currentTable)
                .select('id')
                .eq('username', trimmedUsername)
                .neq('id', isTeacher ? editingUser.id : editingUser.number)
                .maybeSingle();
            if (duplicateSelf) throw new Error("BU KULLANICI ADI ZATEN KULLANIMDA");

            // Check other table duplicate
            const { data: duplicateOther } = await supabase
                .from(otherTable)
                .select('id')
                .eq('username', trimmedUsername)
                .maybeSingle();
            if (duplicateOther) throw new Error(`BU KULLANICI ADI BİR ${isTeacher ? 'ÖĞRENCİ' : 'ÖĞRETMEN'} TARAFINDAN KULLANIMDA`);

            const { error } = await supabase
                .from(currentTable)
                .update({ username: trimmedUsername, password: newPassword, is_first_login: false })
                .eq(isTeacher ? 'id' : 'number', isTeacher ? editingUser.id : editingUser.number);

            if (error) throw error;
            onSuccess("BİLGİLER GÜNCELLENDİ");
            setIsEditModalOpen(false);
            fetchData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredList = (activeTab === 'TEACHERS' ? teachers : students).filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.username || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-[#0d141b] text-white overflow-hidden relative">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-grid-hatched opacity-20 pointer-events-none"></div>

            {/* Header Area */}
            <div className="flex-shrink-0 p-4 pb-2 z-10 bg-gradient-to-b from-[#0d141b] to-[#0d141b]/90 backdrop-blur-sm border-b border-white/5">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-widest text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] leading-none">
                            ŞİFRELER
                        </h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-2 border-l-2 border-[#3b82f6] pl-2">
                            HESAP YÖNETİM MERKEZİ
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-[#1e293b] p-1 rounded-lg border border-white/10 shadow-lg">
                        <button
                            onClick={() => setActiveTab('TEACHERS')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-md text-[10px] font-black tracking-widest transition-all uppercase ${activeTab === 'TEACHERS' ? 'bg-[#3b82f6] text-white shadow-md transform scale-105' : 'text-slate-500 hover:text-white'}`}
                        >
                            Öğretmenler
                        </button>
                        <button
                            onClick={() => setActiveTab('STUDENTS')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-md text-[10px] font-black tracking-widest transition-all uppercase ${activeTab === 'STUDENTS' ? 'bg-[#3b82f6] text-white shadow-md transform scale-105' : 'text-slate-500 hover:text-white'}`}
                        >
                            Öğrenciler
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-2">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                    <input
                        type="text"
                        placeholder={`${activeTab === 'TEACHERS' ? 'Öğretmen' : 'Öğrenci'} Ara...`}
                        className="w-full h-12 bg-[#1e293b]/80 border border-white/10 rounded-xl pl-12 text-sm font-bold text-white outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/50 transition-all placeholder:text-slate-600 uppercase tracking-wider shadow-inner"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 md:p-4 z-0 space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-600 animate-pulse">
                        <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-4"></i>
                        <span className="text-xs font-black tracking-widest">YÜKLENİYOR...</span>
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed border-white/5 rounded-2xl">
                        <i className="fa-solid fa-users-slash text-4xl text-slate-700 mb-4"></i>
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Kayıt Bulunamadı</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-20">
                        {filteredList.map((user: any, index) => (
                            <div key={user.id || user.number} className="group relative bg-[#1e293b]/40 hover:bg-[#1e293b] border border-white/5 hover:border-[#3b82f6]/30 rounded-xl p-4 transition-all duration-200 shadow-md">
                                {/* Decorator Bar */}
                                <div className={`absolute top-4 bottom-4 left-0 w-1 rounded-r-lg transition-colors ${user.username ? 'bg-[#3b82f6]' : 'bg-red-500'}`}></div>

                                <div className="flex items-start gap-4 pl-3">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e293b] to-black border border-white/10 flex items-center justify-center shadow-lg shrink-0">
                                        <span className="text-xs font-black text-slate-400 group-hover:text-white transition-colors">
                                            {user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xs font-black text-white truncate leading-tight mb-1 group-hover:text-[#3b82f6] transition-colors uppercase tracking-wide">
                                            {user.name}
                                        </h3>

                                        <div className="flex flex-col gap-0.5 mt-1.5">
                                            <div className="flex items-center gap-2">
                                                <i className="fa-solid fa-user text-[8px] text-slate-600 w-3 text-center"></i>
                                                <span className={`text-[10px] font-mono tracking-wider ${user.username ? 'text-blue-400' : 'text-red-400 italic'}`}>
                                                    {user.username || 'KULLANICI ADI YOK'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <i className="fa-solid fa-key text-[8px] text-slate-600 w-3 text-center"></i>
                                                <span className={`text-[10px] font-mono tracking-wider ${user.password ? 'text-amber-400' : 'text-red-400 italic'}`}>
                                                    {user.password || 'ŞİFRE YOK'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <button
                                            onClick={() => handleOpenEdit(user)}
                                            className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 flex items-center justify-center hover:bg-[#3b82f6] hover:text-white transition-all shadow-sm"
                                            title="Düzenle"
                                        >
                                            <i className="fa-solid fa-pen text-xs"></i>
                                        </button>
                                        <button
                                            onClick={() => handleShareWhatsapp(user)}
                                            className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                            title="WhatsApp Paylaş"
                                        >
                                            <i className="fa-brands fa-whatsapp text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* EDIT MODAL */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1e293b] border border-white/10 w-full md:max-w-md p-6 rounded-t-2xl md:rounded-2xl shadow-2xl relative animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
                        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6 md:hidden"></div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full bg-[#3b82f6]/20 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] font-black text-lg">
                                {editingUser.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-widest leading-none mb-1">HESAP DÜZENLE</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase truncate max-w-[200px]">{editingUser.name}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="relative group">
                                <label className="text-[9px] font-black text-[#3b82f6] uppercase tracking-widest absolute -top-2 left-2 bg-[#1e293b] px-2 transition-colors group-focus-within:text-white">KULLANICI ADI</label>
                                <input
                                    className="w-full h-12 bg-black/40 border border-white/10 rounded-lg px-4 text-sm font-bold text-white outline-none focus:border-[#3b82f6] transition-all"
                                    value={editForm.username}
                                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                />
                            </div>
                            <div className="relative group">
                                <label className="text-[9px] font-black text-[#fbbf24] uppercase tracking-widest absolute -top-2 left-2 bg-[#1e293b] px-2 transition-colors group-focus-within:text-white">ŞİFRE</label>
                                <input
                                    className="w-full h-12 bg-black/40 border border-white/10 rounded-lg px-4 text-sm font-bold text-[#fbbf24] font-mono outline-none focus:border-[#fbbf24] transition-all"
                                    value={editForm.password}
                                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-10">
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 h-12 border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 rounded-lg transition-colors">İPTAL</button>
                            <button onClick={handleSave} disabled={saving} className="flex-[2] h-12 bg-[#3b82f6] text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 rounded-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-transform active:scale-95">
                                {saving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-check"></i>}
                                {saving ? 'KAYDEDİLİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CredentialsModule;
