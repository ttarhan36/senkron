
import { Gender } from './types';

/**
 * Türkçe karakterleri ASCII muadillerine çevirir ve büyük harf yapar.
 */
export const standardizeForMatch = (text: string): string => {
  if (!text) return "";
  const map: { [key: string]: string } = {
    'İ': 'I', 'I': 'I', 'ı': 'i', 'i': 'i',
    'Ğ': 'G', 'ğ': 'g', 'Ü': 'U', 'ü': 'u',
    'Ş': 'S', 'ş': 's', 'Ö': 'O', 'ö': 'o',
    'Ç': 'C', 'ç': 'c'
  };

  let result = text.replace(/[İIıiĞğÜüŞşÖöÇç]/g, (letter) => map[letter] || letter);
  return result.toUpperCase().trim();
};

/**
 * Gün ismini standart 3 harfli koda çevirir (Pazartesi -> PZT)
 * Çarşamba gününü hem ASCII (CAR) hem Türkçe (ÇAR) olarak yakalar.
 */
export const standardizeDayCode = (day: string): string => {
  if (!day) return "";
  const d = standardizeForMatch(day);
  if (d.startsWith("PAZARTE")) return "PZT";
  if (d.startsWith("SALI")) return "SAL";
  if (d.startsWith("CARSAMB") || d.startsWith("ÇAR") || d === "CAR") return "ÇAR";
  if (d.startsWith("PERSEMB")) return "PER";
  if (d.startsWith("CUMA")) return "CUM";
  if (d.length >= 3) {
    const short = d.substring(0, 3);
    if (short === "PZT") return "PZT";
    if (short === "SAL") return "SAL";
    if (short === "CAR" || short === "ÇAR") return "ÇAR";
    if (short === "PER") return "PER";
    if (short === "CUM") return "CUM";
  }
  return d;
};

/**
 * Şube isminden sınıf seviyesini ayıklar (Örn: "10-A" -> 10)
 */
export const parseGradeFromName = (name: string): number => {
  if (!name) return 9;
  const match = name.match(/^(\d+)/);
  return match ? parseInt(match[1]) : 9;
};

/**
 * Branş varyasyonlarını ORTAK 4 KARAKTERLİ STANDARDA çevirir.
 */
export const standardizeBranchCode = (input: string): string => {
  let s = standardizeForMatch(input || "").replace(/^[LS][-_\.]/, '');

  const aliases: Record<string, string> = {
    // Temel Dersler
    'MAT': 'MATE', 'MATE': 'MATE', 'MATEM': 'MATE', 'MATEMATIK': 'MATE',
    'TUR': 'TURK', 'TURK': 'TURK', 'TURKCE': 'TURK', 'TDE': 'TURK', 'TDEB': 'TURK', 'EDEBIYAT': 'TURK',
    'FEN': 'FENB', 'FENB': 'FENB', 'FENBILIMLERI': 'FENB', 'FENBILGISI': 'FENB',
    'ING': 'INGI', 'INGI': 'INGI', 'INGILIZCE': 'INGI',
    'SOS': 'SOSY', 'SOB': 'SOSY', 'SOSY': 'SOSY', 'SOSYAL': 'SOSY', 'SOSYALBILGILER': 'SOSY',
    // Sayısal Dersler
    'GEO': 'GEOM', 'GEOM': 'GEOM', 'GEOMETRI': 'GEOM',
    'FIZ': 'FIZI', 'FIZI': 'FIZI', 'FIZIK': 'FIZI',
    'KIM': 'KIMY', 'KIMY': 'KIMY', 'KIMYA': 'KIMY',
    'BIY': 'BIYO', 'BIYO': 'BIYO', 'BIYOLOJI': 'BIYO',
    // Sözel Dersler
    'COG': 'COGR', 'COGR': 'COGR', 'COGRAFYA': 'COGR',
    'TAR': 'TARI', 'TARI': 'TARI', 'TARIH': 'TARI',
    'FEL': 'FELS', 'FELS': 'FELS', 'FELSEFE': 'FELS',
    'DIN': 'DKAB', 'DKAB': 'DKAB', 'DINKULTURUVEA': 'DKAB',
    // Beceri Dersleri
    'BED': 'BEDE', 'BEDE': 'BEDE', 'BEDEN': 'BEDE', 'BEDENEGITIMI': 'BEDE',
    'MUZ': 'MUZI', 'MUZI': 'MUZI', 'MUZIK': 'MUZI',
    'GOR': 'GORS', 'GORS': 'GORS', 'GORSEL': 'GORS', 'GORSELSANATLAR': 'GORS', 'RESIM': 'GORS',
    'REH': 'REHB', 'REHB': 'REHB', 'REHBERLIK': 'REHB', 'RY': 'REHB',
    'ALM': 'ALMA', 'ALMA': 'ALMA', 'ALMANCA': 'ALMA',
    // Seçmeli ve Ekstra Dersler
    'BIL': 'BILI', 'BILI': 'BILI', 'BILISIM': 'BILI', 'BILGISAYAR': 'BILI', 'BILTEKNOLOJILERI': 'BILI',
    'SAV': 'SAVE', 'SAVE': 'SAVE', 'SAGLIKBILGISI': 'SAVE', 'SAGLIK': 'SAVE',
    'SOK': 'SOKM', 'SOKM': 'SOKM', 'SECMELIOKUMA': 'SOKM',
    'SEÇ': 'SECM', 'SECM': 'SECM', 'SECMELI': 'SECM', 'SZEK': 'SECM',
    'TEK': 'TEKN', 'TEKN': 'TEKN', 'TEKNOLOJI': 'TEKN', 'TEKNOLOJIVETASARIM': 'TEKN',
    'TRA': 'TRAF', 'TRAF': 'TRAF', 'TRAFIK': 'TRAF',
    'HAB': 'HBVS', 'HBVS': 'HBVS'
  };

  if (aliases[s]) return aliases[s];
  if (s.includes('MATEMATIK')) return 'MATE';
  if (s.includes('EDEBIYAT') || s.includes('TURKCE')) return 'TURK';
  if (s.includes('FIZIK')) return 'FIZI';
  if (s.includes('FENBI')) return 'FENB';
  if (s.includes('SOSYAL')) return 'SOSY';
  if (s.includes('BILISIM') || s.includes('BILGISAYAR')) return 'BILI';
  if (s.includes('REHBER')) return 'REHB';
  if (s.includes('SAGLIK')) return 'SAVE';
  if (s.includes('SECMELI')) return 'SECM';

  return s.substring(0, 4);
};

export const getSectionColor = (className: string) => {
  const name = className.trim().toUpperCase();

  // Sınıf seviyesine göre sabit ana renk tonu (hue)
  const gradeHues: Record<number, number> = {
    1: 0,     // Kırmızı
    2: 30,    // Turuncu
    3: 55,    // Sarı
    4: 90,    // Lime
    5: 140,   // Yeşil
    6: 175,   // Cyan
    7: 210,   // Mavi
    8: 260,   // Mor
    9: 290,   // Magenta
    10: 320,  // Pembe
    11: 35,   // Koyu Turuncu
    12: 195,  // Koyu Cyan
  };

  // Sınıf seviyesini ayıkla
  const gradeMatch = name.match(/^(\d+)/);
  const grade = gradeMatch ? parseInt(gradeMatch[1]) : 0;

  // Şube harfini ayıkla (A, B, C, D...)
  const sectionMatch = name.match(/[A-Z]$/);
  const sectionChar = sectionMatch ? sectionMatch[0] : 'A';
  const sectionIndex = sectionChar.charCodeAt(0) - 65; // A=0, B=1, C=2...

  if (grade > 0 && gradeHues[grade] !== undefined) {
    // Ana renk tonu + şube harfine göre küçük kaydırma
    const hue = (gradeHues[grade] + sectionIndex * 12) % 360;
    const saturation = 70 + (sectionIndex % 3) * 8; // 70-86 arası
    const lightness = 52 + (sectionIndex % 4) * 5;  // 52-67 arası
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  // Bilinmeyen format için fallback: gelişmiş hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 7) - hash + name.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
};

/**
 * Gelişmiş Türkçe İsim/Cinsiyet Analiz Motoru
 * Pınar, Filiz, Sevil gibi isimleri ve ekleri (nur, gül, su, vb.) tanır.
 */
export const guessGenderFromName = (name: string): Gender => {
  const n = standardizeForMatch(name);
  const nameParts = n.split(/\s+/).filter(p => p.length >= 2);
  if (nameParts.length === 0) return Gender.MALE;

  const first = nameParts[0];

  // 1. KESİN KADIN İSİMLERİ LİSTESİ (Sonek kuralına uymayanlar dahil)
  const femaleKeywords = [
    // Belirttiğiniz isimler
    'PINAR', 'FILIZ', 'SEVIL', 'SEVILAY', 'GONUL', 'ISIL', 'IDIL', 'IPEK', 'CIGDEM',
    'AYSE', 'FATMA', 'ZEYNEP', 'ELIF', 'MERYEM', 'EMINE', 'HATICE', 'SULTAN', 'OZLEM',
    'ESRA', 'GAMZE', 'MERVE', 'BUSRA', 'KUBRA', 'EDA', 'SEDA', 'HULYA', 'CANAN', 'SENA',
    'GIZEM', 'DAMLA', 'EBRU', 'YAREN', 'BURCU', 'SELIN', 'GOZDE', 'OZGE', 'DUYGU', 'NILAY',
    'BERNA', 'HANDAN', 'SEVDA', 'DILARA', 'BUKET', 'CEREN', 'ASYA', 'EYLUL', 'NESRIN',
    'LEYLA', 'BERRA', 'PELIN', 'MINE', 'NAZ', 'SILA', 'RUMEYSA', 'SUMEYYE', 'HAVVA',
    'SONGUL', 'ARZU', 'DILEK', 'MEHTAP', 'SEVGI', 'GULSEN', 'GULAY', 'GULER', 'NERIMAN',
    'PERIHAN', 'SEMRA', 'TULIN', 'YELIZ', 'ZELIHA', 'ZUHAL', 'BELGIN', 'SADET', 'DERYA',
    'TUGBA', 'BETUL', 'ASLI', 'BUSE', 'HALE', 'LALE', 'JALE', 'FUNDA', 'BANU', 'MELIS',
    'NURAN', 'NURAY', 'NURCAN', 'GULCAN', 'GULISTN', 'SADET', 'NAZLI', 'SERPIL', 'NIL',
    'ILAYDA', 'SINEM', 'SILA', 'BELMA', 'BEYZA', 'NISA', 'DILAN', 'DICLE', 'SIDIKA',
    'SABRIYE', 'REYYAN', 'TAYYIBE', 'MUKADDES', 'MUSERREF', 'MELIKE', 'MUGE', 'YILDIZ',
    'TULAY', 'SULE', 'DEMET', 'DIDEM', 'AHSEN', 'AZRA', 'AYLIN', 'AYSEL', 'AHRU'
  ];

  if (femaleKeywords.some(f => first === f)) return Gender.FEMALE;

  // 2. GELİŞMİŞ SON EK (SUFFIX) ANALİZİ
  // Türkçede kadın isimleri genellikle bu eklerle biter.
  const femaleSuffixes = [
    'NUR', 'GUL', 'SU', 'NAZ', 'NISA', 'SARE', 'EDA', 'SEDA', 'CANAN', 'BEL', 'NIL', 'AN'
  ];

  // İstisna: Bazı erkek isimleri 'AN' ile bitebilir (HAKAN, KAAN vb.), 
  // bu yüzden 'AN' kontrolünü sadece bilinen kadın isimleri havuzunda yapıyoruz.

  if (first.endsWith('NUR') || first.endsWith('GUL') || first.endsWith('SU') ||
    first.endsWith('NAZ') || first.endsWith('NISA') || first.endsWith('SARE')) {
    return Gender.FEMALE;
  }

  // Özel Karakteristik Bitişler (Örn: 'IZ' -> Filiz, Yeliz, Deniz uniseks ama öğretmenlikte genelde K)
  if (first.endsWith('IZ') && !['AZIZ', 'EDIZ'].includes(first)) return Gender.FEMALE;

  // 'IL' Bitişi (Sevil, Işıl, Idil, Serpil vb.) - İstisnalar: Halil, Celal, İsmail
  const maleIL = ['HALIL', 'ISMAIL', 'CELAL', 'BILAL', 'ADIL'];
  if (first.endsWith('IL') && !maleIL.includes(first)) return Gender.FEMALE;

  // 3. ÖN EK (PREFIX) ANALİZİ
  if (first.startsWith('GUL') || first.startsWith('NUR')) return Gender.FEMALE;

  // 4. UNISEKS İSİMLER (SİSTEM TERCİHİ)
  // Deniz, Görkem, Umut vb. isimler için öğretmen kadrosunda istatistiksel olarak 'K' ağırlığı verilebilir
  const commonUnisexAsFemale = ['DENIZ', 'DERIN', 'GUNES', 'YAGMUR'];
  if (commonUnisexAsFemale.includes(first)) return Gender.FEMALE;

  // Default: Erkek
  return Gender.MALE;
};

export const getGradeFromLesson = (lessonName: string, branchCode: string) => {
  const combined = `${lessonName} ${branchCode}`.toUpperCase();
  const match = combined.match(/(\d+)/);
  return match ? parseInt(match[0]) : null;
};

export const getBranchColor = (input: string) => {
  const s = standardizeBranchCode(input);

  // Her ders için SABİT ve BENZERSİZ renk
  const colorMap: Record<string, string> = {
    'MATE': '#a855f7',  // Mor (Matematik)
    'TURK': '#ef4444',  // Kırmızı (Türkçe / Edebiyat)
    'FENB': '#10b981',  // Yeşil (Fen Bilimleri)
    'INGI': '#f43f5e',  // Gül (İngilizce)
    'SOSY': '#f97316',  // Turuncu (Sosyal Bilgiler)
    'FIZI': '#3b82f6',  // Mavi (Fizik)
    'KIMY': '#f59e0b',  // Amber (Kimya)
    'BIYO': '#059669',  // Koyu Yeşil (Biyoloji)
    'GEOM': '#6366f1',  // İndigo (Geometri)
    'MUZI': '#ec4899',  // Pembe (Müzik)
    'BEDE': '#0ea5e9',  // Gökyüzü Mavisi (Beden)
    'TARI': '#eab308',  // Sarı (Tarih)
    'COGR': '#8b5cf6',  // Menekşe (Coğrafya)
    'FELS': '#14b8a6',  // Deniz Yeşili (Felsefe)
    'DKAB': '#d946ef',  // Fuşya (Din Kültürü)
    'ALMA': '#fb923c',  // Açık Turuncu (Almanca)
    'GORS': '#22c55e',  // Çimen Yeşili (Görsel Sanatlar)
    'REHB': '#84cc16',  // Lime (Rehberlik)
    'BILI': '#06b6d4',  // Cyan (Bilişim)
    'SAVE': '#a3e635',  // Açık Lime (Sağlık)
    'SOKM': '#fb7185',  // Açık Gül (Seçmeli Okuma)
    'SECM': '#c084fc',  // Açık Mor (Seçmeli)
    'TEKN': '#38bdf8',  // Açık Mavi (Teknoloji)
    'TRAF': '#fbbf24',  // Altın (Trafik)
    'HBVS': '#34d399',  // Açık Yeşil (HBV)
  };

  if (colorMap[s]) return colorMap[s];

  // Hash fallback (bilinmeyen dersler için daha ayrık renkler)
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  const hue = ((Math.abs(hash) * 137.508) % 360);
  return `hsl(${Math.floor(hue)}, 75%, 60%)`;
};

export const hexToRgba = (color: string, opacity: number) => {
  if (color.startsWith('hsl')) return color.replace(')', `, ${opacity})`).replace('hsl', 'hsla');
  let r = 0, g = 0, b = 0;
  if (color.length === 7) {
    r = parseInt(color.slice(1, 3), 16);
    g = parseInt(color.slice(3, 5), 16);
    b = parseInt(color.slice(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
