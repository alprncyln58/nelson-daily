import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Settings,
  RefreshCw,
  Plus,
  Clock,
  FileText,
  ChevronRight,
  Stethoscope,
  Activity,
  Search,
  Menu,
  X,
  Heart,
  MessageCircle,
  Flag,
  Send,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  LogIn,
  LogOut,
  Lock,
  MapPin,
  Mail,
  Building,
  Database,
  Key,
  Trash2,
  Edit,
  Users,
  Bell,
  Info,
  Filter,
  Reply,
  Image as ImageIcon,
  Microscope,
  FileBarChart,
  Loader2,
  Calendar,
  Palette,
  Type,
  Bookmark,
  PlayCircle,
  StopCircle,
  Brain,
  Pencil,
  MailCheck,
  List,
  BarChart2,
  Globe,
  Ban,
  UserCheck,
  Share2,
  Eye,
  Moon,
  Sun,
  TrendingUp,
  Book,
  Zap,
  PauseCircle,
  Play,
  Lightbulb,
  MessageSquare,
  Award,
  GraduationCap,
  Star,
  Hash,
  Baby,
  Thermometer,
  // YENİ EKLENENLER:
  CheckSquare,
  Square,
  LayoutList,
  Grid,
  Check,
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from 'firebase/auth';

/* ==========================================================================
   🚀 NELSON DAILY - v1 (Pediatri Versiyonu)
   ========================================================================== */

// --- 1. KONFIGURASYON VE SABİTLER ---

const firebaseConfig = {
  apiKey: 'AIzaSyAuR87uUfc3a5Jm1B3JkYp5JB9rAQkG7XA',
  authDomain: 'harrison-daily.firebaseapp.com',
  projectId: 'harrison-daily',
  storageBucket: 'harrison-daily.firebasestorage.app',
  messagingSenderId: '783908745616',
  appId: '1:783908745616:web:7197ff9f5d14c85f7b8315',
  measurementId: 'G-BV9073R0LM',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ÖNEMLİ: Veritabanı yolunu değiştirdik. Dahiliye verilerinle karışmaz.
// const appId =
//   typeof __app_id !== 'undefined' ? __app_id : 'nelson-daily-pediatri-v1';
const HARRISON_ID = 'harrison-daily-stable-v55'; // Kullanıcılar buradan gelecek
const NELSON_ID = 'nelson-daily-v1'; // Pediatri içerikleri buraya gidecek
const apiKey = 'AIzaSyC7Se6yO6mc8uunXwkxi7O466g4d3yALzc';

// PEDİATRİ KATEGORİLERİ
const CATEGORIES = [
  'Tümü',
  'Genel Pediatri',
  'Yenidoğan (Neonatoloji)',
  'Çocuk Enfeksiyon',
  'Çocuk Acil & Yoğun Bakım',
  'Çocuk Kardiyoloji',
  'Çocuk Nöroloji',
  'Çocuk Endokrinoloji',
  'Çocuk Gastroenteroloji',
  'Çocuk Hematoloji-Onkoloji',
  'Çocuk Nefroloji',
  'Çocuk İmmünoloji ve Alerji',
  'Çocuk Romatoloji',
  'Çocuk Göğüs Hastalıkları',
  'Genetik ve Metabolizma',
  'Adolesan Sağlığı',
];

// --- 2. YARDIMCI FONKSİYONLAR ---

const formatDate = (dateVal, includeTime = false) => {
  if (!dateVal) return '';
  try {
    let date;
    if (dateVal && typeof dateVal.toDate === 'function') {
      date = dateVal.toDate();
    } else if (dateVal && dateVal.seconds) {
      date = new Date(dateVal.seconds * 1000);
    } else {
      date = new Date(dateVal);
    }
    if (isNaN(date.getTime())) return '';
    return includeTime
      ? date.toLocaleString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
          day: 'numeric',
          month: 'numeric',
        })
      : date.toLocaleDateString('tr-TR');
  } catch (e) {
    return '';
  }
};

const SafeRender = ({ content }) => {
  if (content === null || content === undefined) return null;
  if (typeof content === 'string' || typeof content === 'number')
    return <span>{content}</span>;
  if (typeof content === 'object')
    return <span>{JSON.stringify(content)}</span>;
  return null;
};

// --- YENİLENMİŞ PEDİATRİK AI FONKSİYONU ---

// const generateMedicalContent = async (category, specificTopic = null) => {
//   const validCategories = CATEGORIES.filter((c) => c !== 'Tümü').join(', ');
//   const selectedCategory =
//     category === 'Tümü'
//       ? `Aşağıdaki listeden rastgele bir kategori seç: [${validCategories}]`
//       : category;

//   // Rastgelelik için Alfabe Ruleti:
//   const alphabet = 'ABCDEFGHIKLMNOPRSTUVYZ';
//   const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];

//   // PEDİATRİ ODAK ALANLARI
//   const focusAreas = [
//     'Nadir görülen bir genetik sendrom',
//     'Aşı takviminde yer alan veya yer almayan bir enfeksiyon',
//     'Büyüme ve gelişme geriliği ile gelen bir vaka',
//     'Pediatrik acilde sık görülen zehirlenme veya travma',
//     'Yenidoğan dönemine özgü bir patoloji',
//     'TUS Pediatri sınavında sorgulanan önemli bir detay',
//     'Nelson kitabında vurgulanan klinik bir ipucu (Clinical Pearl)',
//   ];
//   const randomFocus = focusAreas[Math.floor(Math.random() * focusAreas.length)];

//   let taskDescription = '';
//   if (specificTopic && specificTopic.trim() !== '') {
//     taskDescription = `GÖREV: "${specificTopic}" konusu hakkında Nelson Textbook of Pediatrics referanslı, kapsamlı bir hastalık/vaka kartı hazırla.
//       Kategori: [${validCategories}].`;
//   } else {
//     taskDescription = `GÖREV: "${selectedCategory}" alanından rastgele bir hastalık seç.
//       ÖNEMLİ KURAL: Asla 'KOAH', 'Alzheimer', 'Koroner Arter Hastalığı', 'Erişkin Tip Diyabet' gibi sadece yetişkinlerde görülen konuları SEÇME.
//       Bunun yerine, "${randomLetter}" harfi ile başlayan veya "${randomFocus}" özelliğine sahip pediatrik bir konu seçmeni istiyorum.
//       Her seferinde mutlaka farklı bir konu seç.`;
//   }

//   // PEDİATRİ ASİSTANI ROLÜ
//   const prompt = `Sen uzman bir Çocuk Sağlığı ve Hastalıkları (Pediatri) asistanısın.
//   Nelson Textbook of Pediatrics referanslı içerik üret. ${taskDescription}
//   Bana şu formatta SADECE geçerli bir JSON döndür:
//   {
//     "title": "Hastalık Adı", "category": "Kategori", "reference": "Nelson 21. Baskı, Bölüm X",
//     "content": { "definition": "...", "pathogenesis": "...", "clinical": "...", "labs": "...", "diagnosis": "...", "treatment_tus": "..." }
//   }`;

//   try {
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
//       {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           contents: [{ parts: [{ text: prompt }] }],
//           generationConfig: {
//             temperature: 1.2,
//             topK: 40,
//             topP: 0.95,
//           },
//         }),
//       }
//     );
//     if (!response.ok) throw new Error('API Error');
//     const data = await response.json();
//     let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
//     if (text) {
//       text = text
//         .replace(/```json/g, '')
//         .replace(/```/g, '')
//         .trim();
//       const firstBrace = text.indexOf('{');
//       const lastBrace = text.lastIndexOf('}');
//       if (firstBrace !== -1 && lastBrace !== -1)
//         text = text.substring(firstBrace, lastBrace + 1);
//       return JSON.parse(text);
//     }
//     return null;
//   } catch (error) {
//     return null;
//   }
// };
const generateMedicalContent = async (category, specificTopic = null) => {
  const validCategories = CATEGORIES.filter((c) => c !== 'Tümü').join(', ');
  const selectedCategory =
    category === 'Tümü'
      ? `Aşağıdaki listeden rastgele bir kategori seç: [${validCategories}]`
      : category;

  // Rastgelelik için Alfabe Ruleti:
  const alphabet = 'ABCDEFGHIKLMNOPRSTUVYZ';
  const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];

  // --- BURAYI GÜNCELLEDİK: KONU YELPAZESİNİ GENİŞLETTİK ---
  const focusAreas = [
    'Nadir görülen bir sendrom veya genetik bozukluk',
    'Aşı takviminde kritik bir detay veya özel aşılar',
    'Nöromotor gelişim basamakları (Örn: 6. ayda neler yapar?)',
    'Pediatrik acilde kullanılan bir resüsitasyon algoritması',
    'Yenidoğan dönemine özgü fizyolojik bir değişim',
    'Sıvı-elektrolit tedavisinde kullanılan bir formül veya hesaplama',
    'Bir zehirlenme vakasında spesifik antidot kullanımı',
    'APGAR, Glasgow veya Silvermann gibi bir skorlama sistemi',
    'TUS sınavında sık sorulan bir spot bilgi',
    "Nelson kitabında 'Clinical Pearls' olarak geçen bir ipucu",
  ];
  const randomFocus = focusAreas[Math.floor(Math.random() * focusAreas.length)];

  let taskDescription = '';
  if (specificTopic && specificTopic.trim() !== '') {
    taskDescription = `GÖREV: "${specificTopic}" konusu hakkında Nelson Textbook of Pediatrics referanslı, kapsamlı bir bilgi kartı hazırla.
      Kategori: [${validCategories}].`;
  } else {
    taskDescription = `GÖREV: "${selectedCategory}" alanından rastgele bir TIBBİ KONU seç.
      ÖNEMLİ KURAL: Sadece hastalıkları seçmek zorunda değilsin.
      Bunun yerine: "${randomFocus}" özelliğine sahip, "${randomLetter}" harfiyle de başlayabilecek spesifik bir konu seç.
      Örnek Konular: 'Yenidoğan Refleksleri', 'Anne Sütü İçeriği', 'Kızamık Aşısı Yan Etkileri', 'Hiponatremi Düzeltme Formülü', 'Kawasaki Tanı Kriterleri' gibi çeşitli konular olabilir.`;
  }

  // --- PROMPT GÜNCELLEMESİ: FORMATI ESNETTİK ---
  // AI'ya hastalık dışı konuları mevcut kutucuklara (patogenez, klinik vb.) nasıl uyduracağını öğretiyoruz.
  const prompt = `Sen uzman bir Çocuk Sağlığı ve Hastalıkları (Pediatri) asistanısın.
      Nelson Textbook of Pediatrics referanslı içerik üret. ${taskDescription}
      
      Çok önemli: Eğer seçtiğin konu bir "Hastalık" değilse (Örn: Gelişim Basamağı, Aşı, Skorlama Sistemi), JSON alanlarını şu mantıkla doldur:
      - definition: Konunun tanımı veya ne olduğu.
      - pathogenesis: Fizyolojik mekanizma, Önemi veya Neden yapıldığı.
      - clinical: Klinik bulgular, Uygulama şekli veya Skorlama kriterleri.
      - labs: Gerekli tetkikler, Referans aralıklar veya İzlem parametreleri.
      - diagnosis: Tanı koydurucu özellikler veya Değerlendirme yöntemi.
      - treatment_tus: Yönetim, Tedavi yaklaşımı veya TUS için bilinmesi gereken "En Önemli" spot bilgi.

      Bana şu formatta SADECE geçerli bir JSON döndür:
      {
        "title": "Başlık (Hastalık veya Konu Adı)", 
        "category": "Kategori", 
        "reference": "Nelson Textbook of Pediatrics, 21. Baskı, Bölüm X",
        "content": { 
            "definition": "...", 
            "pathogenesis": "...", 
            "clinical": "...", 
            "labs": "...", 
            "diagnosis": "...", 
            "treatment_tus": "..." 
        }
      }`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.2, // Yüksek yaratıcılık
            topK: 40,
            topP: 0.95,
          },
        }),
      }
    );
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1)
        text = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    return null;
  }
};
const generateQuizQuestion = async (topicTitle, topicContent) => {
  const prompt = `Konu: ${topicTitle}. İçerik: ${JSON.stringify(topicContent)}.
  TUS Pediatri formatında zor bir soru hazırla. JSON: { "question": "...", "options": ["A)...", "B)...", "C)...", "D)...", "E)..."], "correctAnswer": 0, "explanation": "..." }`;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      text = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    return null;
  }
};

const generateMedicalImage = async (prompt) => {
  try {
    // Pediatrik bağlam eklendi
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [
            {
              prompt: `Medical illustration: ${prompt}. Pediatric context, child anatomy, high detail.`,
            },
          ],
          parameters: { sampleCount: 1, aspectRatio: '4:3' },
        }),
      }
    );
    if (!response.ok) return null;
    const result = await response.json();
    return result.predictions?.[0]?.bytesBase64Encoded
      ? `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`
      : null;
  } catch (error) {
    return null;
  }
};

const generateDifferentialDiagnosis = async (articleContent) => {
  const prompt = `Sen kıdemli bir Pediatri hocasısın.
  Aşağıdaki klinik vakayı analiz et ve Nelson Textbook'a dayanarak en olası 3 ayırıcı tanıyı belirle. HTML listesi olarak döndür. Vaka: ${JSON.stringify(
    articleContent
  )}`;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    return null;
  }
};

const askGeminiAboutCase = async (articleContent, question) => {
  const prompt = `Sen bir Pediatri hocasısın. Vaka: ${JSON.stringify(
    articleContent
  )}. Soru: "${question}".
  Kısa, net cevapla.`;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    return null;
  }
};

const compressImage = (base64Str, maxWidth = 800, quality = 0.6) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64Str);
  });
};

// --- 3. BİLEŞEN TANIMLARI ---

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg =
    type === 'success'
      ? 'bg-green-600'
      : type === 'error'
      ? 'bg-red-600'
      : 'bg-blue-600';
  return (
    <div
      className={`fixed bottom-4 right-4 ${bg} text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-5`}
    >
      {type === 'success' ? (
        <CheckCircle size={24} />
      ) : type === 'error' ? (
        <AlertTriangle size={24} />
      ) : (
        <Info size={24} />
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

const ConfirmModal = ({ isOpen, message, onConfirm, onClose, isDarkMode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className={`${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } rounded-2xl p-6 max-w-sm w-full animate-in zoom-in duration-200 shadow-2xl`}
      >
        <h3 className="text-lg font-bold mb-2">Onay</h3>
        <p
          className={`text-sm mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            İptal
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            Evet
          </button>
        </div>
      </div>
    </div>
  );
};

const ReportModal = ({ isOpen, onClose, onSubmit, articleTitle }) => {
  if (!isOpen) return null;
  const [text, setText] = useState('');
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Flag size={20} className="text-red-500" /> Hata Bildir
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          <span className="font-semibold text-gray-800">{articleTitle}</span>{' '}
          başlığında fark ettiğiniz hatayı belirtin:
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            İptal
          </button>
          <button
            onClick={() => {
              onSubmit(text);
              setText('');
            }}
            disabled={!text.trim()}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Bildirimi Gönder
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginModal = ({ isOpen, onClose, onLogin, onRegister }) => {
  const [mode, setMode] = useState('login');
  // Varsayılan İlgi Alanı Pediatri olarak güncellendi
  const [formData, setFormData] = useState({
    name: '',
    title: 'Tıp Öğrencisi',
    school: '',
    email: '',
    password: '',
    hometown: '',
    birthYear: '',
    interest: 'Pediatri',
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin(loginEmail, loginPassword, setError);
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Zorunlu alanları doldurun');
        return;
      }
      onRegister(formData);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
          </h2>
        </div>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <>
              <input
                type="text"
                placeholder="Ad Soyad"
                className="w-full border p-2 rounded"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Kurum / Fakülte"
                  className="w-full border p-2 rounded"
                  value={formData.school}
                  onChange={(e) =>
                    setFormData({ ...formData, school: e.target.value })
                  }
                />
                <select
                  className="w-full border p-2 rounded bg-white"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                >
                  <option value="Tıp Öğrencisi">Tıp Öğrencisi</option>
                  <option value="İntörn Doktor">İntörn Doktor</option>
                  <option value="Pratisyen Hekim">Pratisyen Hekim</option>
                  <option value="Asistan Doktor">Asistan Doktor</option>
                  <option value="Uzman Doktor">Uzman Doktor</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Memleket (Örn: Hatay)"
                  className="w-full border p-2 rounded"
                  value={formData.hometown}
                  onChange={(e) =>
                    setFormData({ ...formData, hometown: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Doğum Yılı (Örn: 2003)"
                  className="w-full border p-2 rounded"
                  value={formData.birthYear}
                  onChange={(e) =>
                    setFormData({ ...formData, birthYear: e.target.value })
                  }
                />
              </div>
              <input
                type="text"
                placeholder="İlgi Alanı (Örn: Pediatri)"
                className="w-full border p-2 rounded"
                value={formData.interest}
                onChange={(e) =>
                  setFormData({ ...formData, interest: e.target.value })
                }
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={mode === 'login' ? loginEmail : formData.email}
            onChange={(e) =>
              mode === 'login'
                ? setLoginEmail(e.target.value)
                : setFormData({ ...formData, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Şifre"
            className="w-full border p-2 rounded"
            value={mode === 'login' ? loginPassword : formData.password}
            onChange={(e) =>
              mode === 'login'
                ? setLoginPassword(e.target.value)
                : setFormData({ ...formData, password: e.target.value })
            }
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            {mode === 'login' ? 'Giriş' : 'Kayıt Ol'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            className="w-full text-center text-sm text-gray-500 py-2"
          >
            {mode === 'login' ? 'Hesap Oluştur' : 'Giriş Yap'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-sm text-gray-400"
          >
            Kapat
          </button>
        </form>
      </div>
    </div>
  );
};

const EditArticleModal = ({ isOpen, onClose, article, onSave }) => {
  const [formData, setFormData] = useState({});
  useEffect(() => {
    if (article) setFormData({ ...article });
  }, [article]);
  if (!isOpen || !article) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Düzenle</h3>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="space-y-4">
          <input
            className="w-full border p-2 rounded text-sm"
            value={formData.title || ''}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Başlık"
          />
          <select
            className="w-full border p-2 rounded text-sm bg-white"
            value={formData.category || ''}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            {CATEGORIES.slice(1).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            className="w-full border p-2 rounded text-sm"
            value={formData.image || ''}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            placeholder="Görsel URL"
          />
          <input
            className="w-full border p-2 rounded text-sm"
            value={formData.imageCaption || ''}
            onChange={(e) =>
              setFormData({ ...formData, imageCaption: e.target.value })
            }
            placeholder="Görsel Açıklaması"
          />

          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs font-bold text-gray-700">Tanım</label>
            <textarea
              className="w-full border p-2 rounded text-sm h-20"
              value={formData.content?.definition || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  content: { ...formData.content, definition: e.target.value },
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs font-bold text-gray-700">Patogenez</label>
            <textarea
              className="w-full border p-2 rounded text-sm h-24"
              value={formData.content?.pathogenesis || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  content: {
                    ...formData.content,
                    pathogenesis: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs font-bold text-gray-700">Klinik</label>
            <textarea
              className="w-full border p-2 rounded text-sm h-20"
              value={formData.content?.clinical || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  content: { ...formData.content, clinical: e.target.value },
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs font-bold text-gray-700">
              Lab & Görüntüleme
            </label>
            <textarea
              className="w-full border p-2 rounded text-sm h-20"
              value={formData.content?.labs || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  content: { ...formData.content, labs: e.target.value },
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs font-bold text-gray-700">
              Tanı Kriterleri
            </label>
            <textarea
              className="w-full border p-2 rounded text-sm h-20"
              value={formData.content?.diagnosis || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  content: { ...formData.content, diagnosis: e.target.value },
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs font-bold text-gray-700">
              TUS / Tedavi
            </label>
            <textarea
              className="w-full border p-2 rounded text-sm h-24"
              value={formData.content?.treatment_tus || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  content: {
                    ...formData.content,
                    treatment_tus: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg"
          >
            İptal
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

const VerificationModal = ({
  isOpen,
  email,
  onClose,
  onVerify,
  isDarkMode,
}) => {
  const [code, setCode] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className={`${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in duration-200`}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MailCheck size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold">E-posta Doğrulama</h2>
          <p
            className={`text-sm mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {email} adresine gönderilen 6 haneli kodu giriniz.
          </p>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="XXXXXX"
            maxLength={6}
            className={`w-full text-center text-2xl tracking-widest border-2 rounded-xl py-3 focus:outline-none focus:border-blue-500 font-mono ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-300 bg-gray-50'
            }`}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
          />
          <button
            onClick={() => onVerify(code)}
            disabled={code.length !== 6}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
          >
            Doğrula ve Kaydı Tamamla
          </button>

          <button
            onClick={onClose}
            className={`w-full text-center text-sm hover:underline ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};

const EditProfileModal = ({ isOpen, onClose, user, onSave, isDarkMode }) => {
  const [formData, setFormData] = useState({});
  useEffect(() => {
    if (user) setFormData(user);
  }, [user]);
  if (!isOpen) return null;
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className={`${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } rounded-2xl max-w-md w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-100">
            <User size={40} className="text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold">Profili Düzenle</h2>
          <p className="text-sm text-gray-500">Bilgilerini güncel tut.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className={`text-xs font-bold ml-1 mb-1 block ${
                isDarkMode ? 'text-gray-400' : 'text-gray-700'
              }`}
            >
              Ad Soyad
            </label>
            <input
              type="text"
              name="name"
              className={`w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300'
              }`}
              value={formData.name || ''}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`text-xs font-bold ml-1 mb-1 block ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-700'
                }`}
              >
                Kurum
              </label>
              <input
                type="text"
                name="school"
                className={`w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300'
                }`}
                value={formData.school || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                className={`text-xs font-bold ml-1 mb-1 block ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-700'
                }`}
              >
                Ünvan
              </label>
              <select
                name="title"
                className={`w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
                value={formData.title || 'Tıp Öğrencisi'}
                onChange={handleChange}
              >
                <option>Tıp Öğrencisi</option>
                <option>İntörn Doktor</option>
                <option>Pratisyen Hekim</option>
                <option>Asistan Doktor</option>
                <option>Uzman Doktor</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`text-xs font-bold ml-1 mb-1 block ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-700'
                }`}
              >
                Memleket
              </label>
              <input
                type="text"
                name="hometown"
                className={`w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300'
                }`}
                value={formData.hometown || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                className={`text-xs font-bold ml-1 mb-1 block ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-700'
                }`}
              >
                Doğum Yılı
              </label>
              <input
                type="number"
                name="birthYear"
                className={`w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300'
                }`}
                value={formData.birthYear || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label
              className={`text-xs font-bold ml-1 mb-1 block ${
                isDarkMode ? 'text-gray-400' : 'text-gray-700'
              }`}
            >
              İlgi Alanı
            </label>
            <input
              type="text"
              name="interest"
              className={`w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300'
              }`}
              value={formData.interest || ''}
              onChange={handleChange}
            />
          </div>

          <div
            className={`flex justify-end gap-3 mt-8 pt-4 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-100'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-colors"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const QuizModal = ({ isOpen, onClose, quizData, isDarkMode }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setSelectedOption(null);
      setIsSubmitted(false);
    }
  }, [isOpen]);
  if (!isOpen || !quizData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div
        className={`${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
        } rounded-xl max-w-lg w-full p-6 animate-in zoom-in duration-200 shadow-2xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
            <Brain size={20} /> TUS Pediatri Pratik
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>
        <p
          className={`font-medium mb-6 text-sm leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-800'
          }`}
        >
          {quizData.question}
        </p>

        <div className="space-y-3 mb-6">
          {quizData.options.map((option, idx) => (
            <button
              key={idx}
              disabled={isSubmitted}
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left p-3 rounded-lg text-sm border transition-all ${
                isSubmitted
                  ? idx === quizData.correctAnswer
                    ? 'bg-green-100 border-green-500 text-green-800 font-medium'
                    : selectedOption === idx
                    ? 'bg-red-100 border-red-500 text-red-800'
                    : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-400'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                  : selectedOption === idx
                  ? 'bg-blue-50 border-blue-500 text-blue-800'
                  : isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {!isSubmitted ? (
          <button
            disabled={selectedOption === null}
            onClick={() => setIsSubmitted(true)}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            Cevabı Kontrol Et
          </button>
        ) : (
          <div
            className={`${
              isDarkMode
                ? 'bg-blue-900/30 border-blue-800'
                : 'bg-blue-50 border-blue-100'
            } p-4 rounded-lg border animate-in fade-in`}
          >
            <h4
              className={`font-bold text-xs mb-1 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-800'
              }`}
            >
              Açıklama:
            </h4>
            <p
              className={`text-xs ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}
            >
              {quizData.explanation}
            </p>
            <button
              onClick={onClose}
              className="mt-3 text-xs text-gray-500 hover:underline w-full text-center"
            >
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Section = ({
  title,
  content,
  color,
  icon: Icon,
  fontSize,
  isDarkMode,
}) => {
  const colors = {
    blue: isDarkMode
      ? 'text-blue-400 bg-blue-900/20 border-blue-800'
      : 'text-blue-700 bg-blue-50 border-blue-200',
    purple: isDarkMode
      ? 'text-purple-400 bg-purple-900/20 border-purple-800'
      : 'text-purple-700 bg-purple-50 border-purple-200',
    orange: isDarkMode
      ? 'text-orange-400 bg-orange-900/20 border-orange-800'
      : 'text-orange-700 bg-orange-50 border-orange-200',
    green: isDarkMode
      ? 'text-green-400 bg-green-900/20 border-green-800'
      : 'text-green-700 bg-green-50 border-green-200',
    red: isDarkMode
      ? 'text-red-400 bg-red-900/20 border-red-800'
      : 'text-red-700 bg-red-50 border-red-200',
    gray: isDarkMode
      ? 'text-gray-400 bg-gray-800/50 border-gray-700'
      : 'text-gray-700 bg-gray-50 border-gray-200',
  };
  const textSizeClass =
    fontSize === 'large'
      ? 'text-base'
      : fontSize === 'small'
      ? 'text-xs'
      : 'text-sm';

  return (
    <div
      className={`p-4 rounded-xl border ${colors[color]} mb-3 transition-shadow`}
    >
      <h4
        className={`text-sm font-bold mb-2 flex items-center gap-2 ${
          colors[color]?.split(' ')[0]
        }`}
      >
        {Icon && <Icon size={18} />} {title}
      </h4>
      <p
        className={`${textSizeClass} ${
          isDarkMode ? 'text-gray-300' : 'text-gray-800'
        } leading-relaxed text-justify`}
      >
        <SafeRender content={content} />
      </p>
    </div>
  );
};

const StatsCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  color,
  isDarkMode,
}) => (
  <div
    className={`${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p
          className={`text-sm font-medium mb-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {title}
        </p>
        <p
          className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {value}
        </p>
      </div>
      <div className={`p-4 rounded-xl ${color} text-white shadow-sm`}>
        <Icon size={24} />
      </div>
    </div>
    <div
      className={`mt-4 pt-4 border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-50'
      }`}
    >
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <Activity size={12} /> {subtext}
      </p>
    </div>
  </div>
);

const Header = ({
  toggleSidebar,
  currentUser,
  onLoginClick,
  onLogoutClick,
  isDarkMode,
  toggleTheme,
}) => (
  <header
    className={`${
      isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    } border-b sticky top-0 z-40`}
  >
    <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className={`lg:hidden p-2 rounded-md ${
            isDarkMode
              ? 'text-gray-400 hover:bg-gray-800'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Menu size={24} />
        </button>
        <div className="bg-blue-600 p-2 rounded-xl shadow-sm">
          <Baby className="text-white h-6 w-6" />
        </div>
        <div>
          <h1
            className={`text-xl font-bold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Nelson Daily
          </h1>
          <p
            className={`text-xs 
hidden sm:block font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Pediatri Asistanı Eğitim Platformu
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors ${
            isDarkMode
              ? 'text-yellow-400 hover:bg-gray-800'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {currentUser ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p
                className={`text-sm font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {currentUser.name}
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {currentUser.title}
              </p>
            </div>
            <img
              src={currentUser.avatar}
              alt="Profile"
              className="h-10 w-10 rounded-full border-2 
border-white shadow-sm bg-gray-100 object-cover"
            />
            <button
              onClick={onLogoutClick}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Çıkış"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md transition-all hover:shadow-lg"
          >
            <LogIn size={16} /> Giriş Yap
          </button>
        )}
      </div>
    </div>
  </header>
);

const Sidebar = ({
  activeTab,
  setActiveTab,
  isOpen,
  toggleSidebar,
  currentUser,
  isDarkMode,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Genel Bakış',
      icon: Activity,
      requiresAuth: false,
    },
    {
      id: 'articles',
      label: 'Pediatrik Vakalar',
      icon: FileText,
      requiresAuth: false,
    },
    { id: 'profile', label: 'Profilim', icon: User, requiresAuth: true },
    // Admin Only
    {
      id: 'generator',
      label: 'Vaka Üreticisi',
      icon: RefreshCw,
      requiresAuth: true,
      adminOnly: true,
    },
    {
      id: 'users',
      label: 'Kullanıcılar',
      icon: Users,
      requiresAuth: true,
      adminOnly: true,
    },
    {
      id: 'reports',
      label: 'Bildirimler',
      icon: Bell,
      requiresAuth: true,
      adminOnly: true,
    },
    {
      id: 'logs',
      label: 'Sistem Kayıtları',
      icon: List,
      requiresAuth: true,
      adminOnly: true,
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: Settings,
      requiresAuth: true,
      adminOnly: true,
    },
  ];
  const handleTabClick = (id) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) toggleSidebar();
  };
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 ${
          isDarkMode
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
        } border-r transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col`}
      >
        <div className="h-full flex flex-col justify-between">
          <div className="p-6">
            <div className="flex items-center justify-between lg:hidden mb-8">
              <span
                className={`font-bold text-lg ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Menü
              </span>
              <button onClick={toggleSidebar}>
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <nav className="space-y-2">
              {menuItems
                .filter(
                  (item) =>
                    (!item.requiresAuth || currentUser) &&
                    (!item.adminOnly || currentUser?.role === 'admin')
                )
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                      activeTab === item.id
                        ? isDarkMode
                          ? 'bg-blue-900/40 text-blue-400'
                          : 'bg-blue-50 text-blue-700 shadow-sm'
                        : isDarkMode
                        ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        activeTab === item.id
                          ? isDarkMode
                            ? 'text-blue-400'
                            : 'text-blue-700'
                          : 'text-gray-400'
                      } ${item.id === 'reports' ? 'text-red-500' : ''}`}
                    />{' '}
                    {item.label}
                  </button>
                ))}
            </nav>
          </div>
          <div
            className={`p-6 border-t ${
              isDarkMode
                ? 'border-gray-800 bg-gray-800/50'
                : 'border-gray-100 bg-gray-50/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  currentUser ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                }`}
              ></div>
              <span
                className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {currentUser ? 'Çevrimiçi' : 'Çevrimdışı'}
              </span>
            </div>
            <h4
              className={`text-sm font-bold truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {currentUser ? currentUser.name : 'Misafir Kullanıcı'}
            </h4>
            <p
              className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}
            >
              {currentUser
                ? currentUser.role === 'admin'
                  ? 'Yönetici Yetkisi'
                  : 'Standart Yetki'
                : 'Sınırlı Erişim'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

const ArticleCard = ({
  article,
  expanded,
  toggleExpand,
  onLike,
  onComment,
  onReply,
  onDeleteComment,
  onDelete,
  onReport,
  onEdit,
  onBookmark,
  onQuiz,
  onViewProfile,
  currentUser,
  onLoginRequest,
  onShare,
  onVerify,
  onView,
  fontSize,
  isDarkMode,
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // AI STATES
  const [diffDx, setDiffDx] = useState(null);
  const [isGeneratingDx, setIsGeneratingDx] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState(null);
  const [isChatting, setIsChatting] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const likes = article.likes || [];
  const comments = article.comments || [];
  const bookmarks = currentUser?.bookmarks || [];
  const isLiked = likes.includes(currentUser?.id);
  const isBookmarked = bookmarks.includes(article.id);
  const isVerified = article.isVerified || false;
  const safeDefinition =
    article.content && typeof article.content.definition === 'string'
      ? article.content.definition
      : 'İçerik yükleniyor...';

  const handleToggleExpand = () => {
    if (!expanded && onView) {
      onView(article.id);
    }
    toggleExpand();
  };

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const text = `${article.title}. Tanım: ${article.content?.definition}. Klinik: ${article.content?.clinical}. Tedavi: ${article.content?.treatment_tus}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };
  // Handle Diff Diagnosis
  const handleGetDiffDx = async () => {
    if (diffDx) return;
    setIsGeneratingDx(true);
    const result = await generateDifferentialDiagnosis(article.content);
    setDiffDx(result);
    setIsGeneratingDx(false);
  };

  // Handle Chat
  const handleChatSubmit = async () => {
    if (!chatQuestion.trim()) return;
    setIsChatting(true);
    const result = await askGeminiAboutCase(article.content, chatQuestion);
    setChatAnswer(result);
    setIsChatting(false);
  };
  return (
    <div
      className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-2xl shadow-sm border overflow-hidden mb-6 hover:shadow-md transition-all duration-300`}
    >
      <div
        className="p-6 cursor-pointer flex justify-between items-start"
        onClick={handleToggleExpand}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                isDarkMode
                  ? 'bg-blue-900/30 text-blue-400 border-blue-800'
                  : 'bg-blue-100 text-blue-700 border-blue-200'
              }`}
            >
              {article.category}
            </span>
            {isVerified && (
              <span
                className="px-3 py-1 
rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 flex items-center gap-1"
              >
                <Shield size={12} className="fill-current" /> Editör Onaylı
              </span>
            )}
            <span
              className={`text-xs flex items-center font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`}
            >
              <Clock size={12} className="mr-1" />
              {formatDate(article.date)}
            </span>
          </div>
          <h3
            className={`text-xl font-bold mb-2 leading-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {article.title}
          </h3>
          <p
            className={`text-sm line-clamp-2 font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <SafeRender content={safeDefinition} />
          </p>
        </div>
        <div className="flex flex-col items-end gap-3 ml-4">
          <div
            className={`p-2 rounded-full transition-colors ${
              expanded
                ? 'bg-blue-50 text-blue-600'
                : isDarkMode
                ? 'bg-gray-700 text-gray-400'
                : 'bg-gray-50 text-gray-400'
            }`}
          >
            <ChevronRight
              className={`transform transition-transform duration-300 ${
                expanded ? 'rotate-90' : ''
              }`}
              size={20}
            />
          </div>
          {expanded && (
            <div className="flex gap-2 mt-1 animate-in fade-in slide-in-from-right-2">
              <button
                onClick={handleSpeak}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 text-indigo-400'
                    : 'bg-indigo-50 text-indigo-600'
                }`}
                title="Sesli"
              >
                <PlayCircle size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(article);
                }}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 text-green-400'
                    : 'bg-green-50 text-green-600'
                }`}
                title="Paylaş"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(article.id);
                }}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked
                    ? isDarkMode
                      ? 'bg-yellow-900/30 text-yellow-500'
                      : 'bg-yellow-50 text-yellow-500'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-100 text-gray-400'
                }`}
                title="Kaydet"
              >
                <Bookmark
                  size={18}
                  className={isBookmarked ? 'fill-current' : ''}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {expanded && article.content && (
        <>
          <div
            className={`px-6 pb-6 pt-0 border-t relative ${
              isDarkMode ? 'border-gray-700' : 'border-gray-100'
            }`}
          >
            {currentUser?.role === 'admin' && (
              <div className="absolute top-4 right-6 flex gap-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVerify(article);
                  }}
                  className={`rounded-lg p-1.5 shadow-sm border transition-colors ${
                    article.isVerified
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-white text-gray-400'
                  }`}
                  title={article.isVerified ? 'Onayı Kaldır' : 'İçeriği Onayla'}
                >
                  <Shield
                    size={16}
                    className={article.isVerified ? 'fill-current' : ''}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(article);
                  }}
                  className="text-blue-600 bg-white rounded-lg p-1.5 shadow-sm 
border border-gray-200"
                  title="Düzenle"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(article.id);
                  }}
                  className="text-red-600 bg-white rounded-lg p-1.5 shadow-sm border border-gray-200"
                  title="Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            <div className="mt-8 space-y-6">
              {article.reference && (
                <div
                  className={`flex items-start gap-3 p-3 rounded-xl text-xs font-medium border ${
                    isDarkMode
                      ? 'bg-blue-900/20 text-blue-300 border-blue-800'
                      : 'bg-blue-50 text-blue-800 border-blue-100'
                  }`}
                >
                  <BookOpen size={16} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-bold opacity-70 mb-0.5">
                      REFERANS
                    </span>
                    {article.reference}
                  </div>
                </div>
              )}
              {article.image && (
                <div className="mb-8 rounded-xl overflow-hidden border shadow-inner">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-80 object-cover hover:scale-105 transition-transform duration-700"
                  />
                  {article.imageCaption && (
                    <div
                      className={`p-3 border-t backdrop-blur-sm ${
                        isDarkMode
                          ? 'bg-gray-800/90 border-gray-700'
                          : 'bg-white/90 border-gray-200'
                      }`}
                    >
                      <p
                        className={`text-xs font-medium flex items-center gap-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        <ImageIcon size={14} className="text-blue-600" />
                        {article.imageCaption}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* AI ACTIONS BAR */}
              <div className="flex flex-wrap gap-3 justify-end mb-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChat(!showChat);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                    showChat
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <MessageSquare size={18} />{' '}
                  {showChat ? 'Asistanı Gizle' : 'Hocaya Sor'}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGetDiffDx();
                  }}
                  disabled={isGeneratingDx}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                    diffDx
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                >
                  {isGeneratingDx ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Lightbulb size={18} />
                  )}
                  Ayırıcı Tanı
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuiz(article);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 shadow-md transition-all"
                >
                  <Brain size={18} /> TUS Sorusu Çöz
                </button>
              </div>

              {/* DIFF DIAGNOSIS RESULT */}

              {diffDx && (
                <div
                  className={`p-4 rounded-xl border animate-in slide-in-from-top-4 ${
                    isDarkMode
                      ? 'bg-green-900/20 border-green-800'
                      : 'bg-green-50 border-green-100'
                  }`}
                >
                  <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                    <Stethoscope size={16} /> Ayırıcı Tanı (Gemini Analysis)
                  </h4>
                  <div
                    className={`text-sm ${
                      isDarkMode ? 'text-green-300' : 'text-green-800'
                    }`}
                    dangerouslySetInnerHTML={{ __html: diffDx }}
                  ></div>
                </div>
              )}

              {/* CHAT SECTION */}
              {showChat && (
                <div
                  className={`p-4 rounded-xl border animate-in slide-in-from-top-4 ${
                    isDarkMode
                      ? 'bg-blue-900/20 border-blue-800'
                      : 'bg-blue-50 border-blue-100'
                  }`}
                >
                  <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                    <MessageCircle size={16} /> Vaka Asistanı
                  </h4>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Örn: Neden hipokalsemi gelişti?"
                      className={`flex-1 p-2 rounded-lg border text-sm ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-blue-200'
                      }`}
                      value={chatQuestion}
                      onChange={(e) => setChatQuestion(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChatSubmit();
                      }}
                      disabled={isChatting}
                      className="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold hover:bg-blue-700"
                    >
                      {isChatting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                  {chatAnswer && (
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        isDarkMode
                          ? 'bg-gray-800 text-gray-300'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      <span className="font-bold block mb-1">Cevap:</span>
                      {chatAnswer}
                    </div>
                  )}
                </div>
              )}

              <Section
                title="Tanım"
                content={article.content.definition}
                color="blue"
                icon={Info}
                fontSize={fontSize}
                isDarkMode={isDarkMode}
              />

              <Section
                title="Patogenez"
                content={article.content.pathogenesis}
                color="purple"
                icon={Microscope}
                fontSize={fontSize}
                isDarkMode={isDarkMode}
              />
              <Section
                title="Klinik"
                content={article.content.clinical}
                color="orange"
                icon={Activity}
                fontSize={fontSize}
                isDarkMode={isDarkMode}
              />
              {article.content.labs && (
                <Section
                  title="Laboratuvar & Görüntüleme"
                  content={article.content.labs}
                  color="gray"
                  icon={FileBarChart}
                  fontSize={fontSize}
                  isDarkMode={isDarkMode}
                />
              )}
              <Section
                title="Tanı"
                content={article.content.diagnosis}
                color="green"
                icon={CheckCircle}
                fontSize={fontSize}
                isDarkMode={isDarkMode}
              />
              <Section
                title="Tedavi"
                content={article.content.treatment_tus}
                color="red"
                icon={Stethoscope}
                fontSize={fontSize}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          <div
            className={`px-6 py-4 border-t flex items-center justify-between ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  currentUser ? onLike(article.id) : onLoginRequest();
                }}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  isLiked ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Heart size={20} className={isLiked ? 'fill-current' : ''} />{' '}
                {likes.length}
              </button>
              <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
                <MessageCircle size={20} /> {comments.length}
              </button>
              <div
                className="flex items-center gap-2 text-sm font-bold text-gray-500"
                title="Görüntülenme"
              >
                <Eye size={20} /> {article.views || 0}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReport(article);
              }}
              className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
            >
              <Flag size={14} /> Bildir
            </button>
          </div>

          <div
            className={`px-6 pb-6 ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'
            }`}
          >
            {currentUser ? (
              <div className="flex gap-3 mb-6 pt-4">
                <img
                  src={currentUser.avatar}
                  className="w-8 h-8 rounded-full border border-gray-200 bg-white"
                  alt=""
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Bir yorum yaz..."
                    className={`w-full border rounded-xl pl-4 pr-12 py-2.5 text-sm focus:outline-none ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      if (commentText.trim()) {
                        onComment(article.id, commentText);
                        setCommentText('');
                      }
                    }}
                    className="absolute right-2 top-1.5 p-1 bg-blue-600 text-white rounded-lg"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={onLoginRequest}
                className="flex items-center justify-center p-4 mb-6 mt-4 bg-white rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all gap-2 shadow-sm"
              >
                <Lock size={16} /> Yorum yapmak için giriş yapmalısınız
              </div>
            )}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="group relative pl-3 border-l-2 border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="bg-white p-3.5 rounded-r-xl border border-l-0 border-gray-100 text-sm shadow-sm">
                    <div className="flex justify-between items-center mb-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewProfile(comment.userId);
                        }}
                        className={`font-bold text-xs hover:underline ${
                          comment.userId === currentUser?.id
                            ? 'text-blue-700'
                            : 'text-gray-900'
                        }`}
                      >
                        {comment.user}
                      </button>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(comment.date)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2 leading-snug">
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-4">
                      {currentUser && (
                        <button
                          onClick={() => {
                            setActiveReplyId(
                              activeReplyId === comment.id ? null : comment.id
                            );
                            setReplyText('');
                          }}
                          className="text-xs font-semibold text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                        >
                          <Reply size={12} /> Yanıtla
                        </button>
                      )}
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() =>
                            onDeleteComment(article.id, comment.id)
                          }
                          className="text-xs font-semibold text-gray-300 hover:text-red-600 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={12} /> Sil
                        </button>
                      )}
                    </div>
                  </div>

                  {activeReplyId === comment.id && (
                    <div className="ml-4 mt-2 flex gap-2 animate-in fade-in slide-in-from-top-2">
                      <input
                        type="text"
                        placeholder="Yanıtla..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        autoFocus
                      />

                      <button
                        onClick={() => {
                          if (replyText.trim()) {
                            onReply(article.id, comment.id, replyText);
                            setReplyText('');
                            setActiveReplyId(null);
                          }
                        }}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700"
                      >
                        Gönder
                      </button>
                    </div>
                  )}
                  {comment.replies?.map((reply) => (
                    <div key={reply.id} className="ml-6 mt-2">
                      <div className="bg-gray-50 p-2.5 rounded-lg text-xs relative group/reply border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewProfile(reply.userId);
                            }}
                            className={`font-bold hover:underline ${
                              reply.userId === currentUser?.id
                                ? 'text-blue-600'
                                : 'text-gray-700'
                            }`}
                          >
                            {reply.user}
                          </button>
                          <span className="text-gray-400 text-[10px]">
                            {formatDate(reply.date)}
                          </span>
                        </div>
                        <p className="text-gray-600">{reply.text}</p>
                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() =>
                              onDeleteComment(article.id, comment.id, reply.id)
                            }
                            className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover/reply:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const SettingsView = ({ settings, setSettings, isDarkMode }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <h2
        className={`text-2xl font-bold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}
      >
        Ayarlar
      </h2>
      <div
        className={`${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        } rounded-xl shadow-sm border overflow-hidden mb-6`}
      >
        <div
          className={`p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }`}
        >
          <h3
            className={`font-semibold 
mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            <RefreshCw size={18} /> İçerik Sıklığı
          </h3>
          <div className="flex items-center justify-between">
            <div
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Günlük Üretim Limiti
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    dailyLimit: Math.max(1, settings.dailyLimit - 1),
                  })
                }
                className={`w-8 h-8 rounded-full ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                -
              </button>
              <span
                className={`font-bold w-6 text-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {settings.dailyLimit}
              </span>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    dailyLimit: settings.dailyLimit + 1,
                  })
                }
                className={`w-8 h-8 rounded-full ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div
          className={`p-6 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }`}
        >
          <h3
            className={`font-semibold mb-4 flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            <Type size={18} /> Görünüm - Yazı Boyutu
          </h3>
          <div className="flex gap-2">
            {['small', 'medium', 'large'].map((size) => (
              <button
                key={size}
                onClick={() => setSettings({ ...settings, fontSize: size })}
                className={`flex-1 py-2 text-sm border rounded-lg ${
                  settings.fontSize === size
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : isDarkMode
                    ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {size === 'small'
                  ? 'Küçük'
                  : size === 'medium'
                  ? 'Orta'
                  : 'Büyük'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersPanel = ({ users, onBan, isDarkMode }) => (
  <div className="max-w-5xl mx-auto">
    <h2
      className={`text-2xl font-bold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}
    >
      Kullanıcı Yönetimi
    </h2>
    <div
      className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-xl shadow-sm border overflow-hidden`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <tr>
              <th
                className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Kullanıcı
              </th>
              <th
                className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Ünvan & Kurum
              </th>
              <th
                className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Rol
              </th>
              <th
                className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Durum
              </th>
              <th
                className={`px-6 py-4 text-right text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                İşlem
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}
          >
            {users.map((user) => (
              <tr
                key={user.id}
                className={`transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      className={`h-10 w-10 rounded-full ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                      src={user.avatar}
                      alt=""
                    />
                    <div className="ml-4">
                      <div
                        className={`text-sm font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}
                  >
                    {user.title}
                  </div>
                  <div className="text-xs text-gray-500">{user.school}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {user.role.toUpperCase()}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`flex items-center gap-1.5 text-xs font-medium ${
                      user.isBanned ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        user.isBanned ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    ></div>
                    {user.isBanned ? 'Yasaklı' : 'Aktif'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => onBan(user)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        user.isBanned
                          ? isDarkMode
                            ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : isDarkMode
                          ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {user.isBanned ? (
                        <span className="flex items-center gap-1">
                          <UserCheck size={12} /> Aç
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Ban size={12} /> Yasakla
                        </span>
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const LogsPanel = ({ logs }) => (
  <div className="max-w-5xl mx-auto">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">
      Sistem Kayıtları (Logs)
    </h2>
    <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 overflow-hidden text-gray-300 font-mono text-xs p-4 h-[500px] overflow-y-auto">
      {logs.length === 0 ? (
        <p className="text-gray-500">Kayıt bulunamadı...</p>
      ) : (
        logs.map((log) => (
          <div
            key={log.id}
            className="mb-2 pb-2 border-b border-gray-800 last:border-0"
          >
            <span className="text-blue-400">
              [{formatDate(log.timestamp || log.date, true)}]
            </span>
            <span className="text-green-400 mx-2">
              {log.user.toUpperCase()}
            </span>
            :<span className="text-gray-300 ml-2">{log.action}</span>
          </div>
        ))
      )}
    </div>
  </div>
);

const GeneratorPanel = ({
  onGenerate,
  isGenerating,
  dailyLimit,
  currentCount,
  isAutoGenerating,
  toggleAutoGenerate,
}) => {
  const [customTopic, setCustomTopic] = useState('');
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vaka Üreticisi</h2>
          <p className="text-sm text-gray-500 mt-1">
            Nelson Destekli Yapay Zeka
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleAutoGenerate}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
              isAutoGenerating
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {isAutoGenerating ? (
              <>
                <PauseCircle size={18} className="animate-pulse" /> Oto-Pilot
                Aktif
              </>
            ) : (
              <>
                <Play size={18} /> Oto-Pilot Başlat
              </>
            )}
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-500">Bugün</div>
            <div className="text-2xl font-bold text-blue-600">
              {currentCount} / {dailyLimit}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-blue-50 rounded-xl p-6 flex flex-col items-center justify-center border border-blue-100 text-center relative overflow-hidden">
        {isAutoGenerating && (
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-loading-bar"></div>
        )}
        {isGenerating ? (
          <div className="py-8">
            <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
            <p className="text-blue-800 font-medium">
              Nelson taranıyor & Görsel çiziliyor...
            </p>
          </div>
        ) : (
          <>
            <div className="w-full max-w-md mb-4">
              <input
                type="text"
                placeholder="Örn: Kawasaki Hastalığı (Boş bırakırsan rastgele üretilir)"
                className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
              />
            </div>
            <button
              onClick={() => onGenerate(customTopic)}
              disabled={currentCount >= dailyLimit || isAutoGenerating}
              className={`px-6 py-3 rounded-lg font-medium flex items-center 
shadow-sm transition-all ${
                currentCount >= dailyLimit || isAutoGenerating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <RefreshCw size={20} className="mr-2" />{' '}
              {customTopic ? 'Konuyu Üret' : 'Yeni Vaka Üret'}
            </button>
            {isAutoGenerating && (
              <p className="text-xs text-green-600 mt-3 font-medium animate-pulse">
                Sistem arka planda çalışıyor... (Her 30sn'de bir vaka)
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ReportsPanel = ({ reports, onResolve }) => (
  <div className="max-w-4xl mx-auto">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Bildirimler</h2>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {reports.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Bildirim yok.</div>
      ) : (
        reports.map((report) => (
          <div
            key={report.id}
            className="p-4 border-b border-gray-100 last:border-0 flex justify-between items-start"
          >
            <div>
              <h4 className="font-bold text-gray-900">{report.articleTitle}</h4>
              <p className="text-sm text-gray-600">{report.issue}</p>
            </div>

            {report.status === 'pending' && (
              <button
                onClick={() => onResolve(report.id)}
                className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded border border-green-200"
              >
                Okundu
              </button>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);

const AdminContentPanel = ({ articles, onDelete, onVerify, isDarkMode }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  // Tümünü Seç / Kaldır
  const toggleSelectAll = () => {
    if (selectedIds.length === articles.length) setSelectedIds([]);
    else setSelectedIds(articles.map((a) => a.id));
  };

  // Tekli Seç
  const toggleSelect = (id) => {
    if (selectedIds.includes(id))
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  // Toplu İşlemler
  const handleBulkDelete = () => {
    if (confirm(`${selectedIds.length} adet içerik silinecek. Emin misin?`)) {
      selectedIds.forEach((id) => onDelete(id));
      // Tek tek silme fonksiyonunu çağırır
      setSelectedIds([]);
    }
  };
  const handleBulkVerify = () => {
    selectedIds.forEach((id) => {
      const article = articles.find((a) => a.id === id);
      if (article) onVerify(article);
    });
    setSelectedIds([]);
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Üst Bar: Aksiyonlar */}
      {selectedIds.length > 0 && (
        <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between animate-in fade-in">
          <span className="text-sm font-bold text-blue-800">
            {selectedIds.length} öğe seçildi
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkVerify}
              className="flex 
items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
            >
              <Shield size={14} /> Toplu Onayla
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
            >
              <Trash2 size={14} /> Toplu Sil
            </button>
          </div>
        </div>
      )}

      {/* Tablo */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={toggleSelectAll}
                  className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                >
                  {selectedIds.length === articles.length &&
                  articles.length > 0 ? (
                    <CheckSquare size={20} />
                  ) : (
                    <Square size={20} />
                  )}
                </button>
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Başlık
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Kategori
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Durum
              </th>
              <th
                className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Tarih
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}
          >
            {articles.map((article) => (
              <tr
                key={article.id}
                className={
                  selectedIds.includes(article.id)
                    ? isDarkMode
                      ? 'bg-blue-900/20'
                      : 'bg-blue-50'
                    : ''
                }
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleSelect(article.id)}
                    className={
                      selectedIds.includes(article.id)
                        ? 'text-blue-600'
                        : isDarkMode
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }
                  >
                    {selectedIds.includes(article.id) ? (
                      <CheckSquare size={20} />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`text-sm font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {article.title}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-300'
                        : 'bg-gray-100 border-gray-200 text-gray-600'
                    }`}
                  >
                    {article.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {article.isVerified ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                      <Shield size={12} /> Onaylı
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Taslak</span>
                  )}
                </td>
                <td
                  className={`px-6 py-4 text-right text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {formatDate(article.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProfileView = ({ user, articles, onEditProfile, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('bookmarks');
  const userBookmarks = articles.filter((a) => user.bookmarks?.includes(a.id));

  // Fake level calculation based on bookmarks
  const level = Math.floor((user.bookmarks?.length || 0) / 5) + 1;
  const progress = ((user.bookmarks?.length || 0) % 5) * 20;
  const StatItem = ({ label, value, icon: Icon, colorClass }) => (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border ${
        isDarkMode
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white border-gray-100 shadow-sm'
      }`}
    >
      <div className={`p-2.5 rounded-lg ${colorClass}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p
          className={`text-xs font-medium ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {label}
        </p>

        <p
          className={`text-xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* 1. PROFESSIONAL HEADER CARD */}
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-b-3xl h-48 shadow-lg"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')] opacity-10 rounded-b-3xl h-48"></div>

        <div className="relative pt-24 px-4 sm:px-8 pb-4">
          <div
            className={`relative flex flex-col sm:flex-row items-end gap-6 p-6 rounded-2xl shadow-xl backdrop-blur-md border ${
              isDarkMode
                ? 'bg-gray-900/90 border-gray-700'
                : 'bg-white/95 border-white'
            }`}
          >
            <div className="relative">
              <img
                src={user.avatar}
                className={`w-32 h-32 rounded-2xl border-4 shadow-lg object-cover ${
                  isDarkMode ? 'border-gray-800' : 'border-white'
                }`}
                alt="Profile"
              />
              <div
                className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 
text-xs font-bold px-2 py-1 rounded-full shadow border-2 border-white flex items-center gap-1"
              >
                <Star size={12} className="fill-current" /> Lv.
                {level}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left mb-2">
              <h1
                className={`text-3xl font-extrabold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {user.name}
              </h1>
              <p
                className={`text-lg font-medium flex items-center justify-center sm:justify-start gap-2 ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-600'
                }`}
              >
                <Stethoscope size={18} /> {user.title}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Building size={14} /> {user.school}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> {user.hometown || 'Türkiye'}
                </span>
              </div>
            </div>

            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="px-5 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm flex items-center gap-2"
              >
                <Edit size={16} /> Düzenle
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        {/* LEFT COLUMN: IDENTITY 
& BADGES */}
        <div className="lg:col-span-1 space-y-6">
          {/* LEVEL PROGRESS */}
          <div
            className={`p-6 rounded-2xl border shadow-sm ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span
                className={`text-sm font-bold ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Kıdem İlerlemesi
              </span>
              <span className="text-xs font-bold text-blue-600">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Sonraki seviye için {5 - ((user.bookmarks?.length || 0) % 5)} vaka
              daha kaydet.
            </p>
          </div>

          {/* INFO CARD */}
          <div
            className={`p-6 
rounded-2xl border shadow-sm ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <h3
              className={`font-bold text-lg mb-4 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}
            >
              <Info size={18} className="text-blue-500" /> Kimlik Kartı
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <Mail size={16} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-400">E-Posta</p>
                  <p
                    className={`text-sm font-medium truncate ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Doğum Yılı</p>

                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    {user.birthYear || '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <GraduationCap size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">İlgi Alanı</p>
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    {user.interest || 'Genel'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Katılım</p>

                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    {new Date(user.dateJoined).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BADGES (Mockup for Visuals) */}
          <div
            className={`p-6 rounded-2xl border shadow-sm ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <h3
              className={`font-bold text-lg mb-4 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}
            >
              <Award size={18} className="text-orange-500" /> Rozetler
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <div
                className="aspect-square rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-yellow-600 shadow-sm"
                title="Erken 
Üye"
              >
                <Star size={20} />
              </div>
              <div
                className="aspect-square rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 shadow-sm"
                title="Kitap Kurdu"
              >
                <Book size={20} />
              </div>
              <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 border border-dashed border-gray-300">
                <Lock size={16} />
              </div>
              <div
                className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 border 
border-dashed border-gray-300"
              >
                <Lock size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STATS & CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          {/* STATS ROW */}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatItem
              label="Toplam Kayıt"
              value={user.bookmarks?.length || 0}
              icon={Bookmark}
              colorClass="bg-blue-500"
            />
            <StatItem
              label="Soru Çözümü"
              value="0"
              icon={Brain}
              colorClass="bg-purple-500"
            />
            <StatItem
              label="Katkı Puanı"
              value="120"
              icon={TrendingUp}
              colorClass="bg-green-500"
            />
          </div>

          {/* TABS */}
          <div
            className={`rounded-xl p-1 flex gap-1 border ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-gray-100 border-gray-200'
            }`}
          >
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'bookmarks'
                  ? isDarkMode
                    ? 'bg-gray-700 text-white shadow'
                    : 'bg-white text-gray-900 shadow'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Kaydedilenler
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'activity'
                  ? isDarkMode
                    ? 'bg-gray-700 text-white shadow'
                    : 'bg-white text-gray-900 shadow'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Aktivite
            </button>
          </div>

          {/* CONTENT AREA */}
          <div className="min-h-[300px]">
            {activeTab === 'bookmarks' &&
              (userBookmarks.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {userBookmarks.map((article) => (
                    <div
                      key={article.id}
                      className={`p-5 rounded-xl border flex items-start gap-4 transition-all hover:shadow-md ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                          : 'bg-white border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg flex-shrink-0 ${
                          isDarkMode
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-0.5 rounded dark:bg-blue-900/30 dark:text-blue-300">
                            {article.category}
                          </span>

                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={10} /> {formatDate(article.date)}
                          </span>
                        </div>

                        <h4
                          className={`font-bold text-lg mb-1 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {article.title}
                        </h4>
                        <p
                          className={`text-sm line-clamp-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {article.content?.definition}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                      isDarkMode
                        ? 'bg-gray-800 text-gray-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Bookmark size={32} />
                  </div>

                  <h3
                    className={`text-lg font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Henüz bir şey yok
                  </h3>
                  <p className="text-sm text-gray-500">
                    İlginizi çeken vakaları kaydederek burada
                    arşivleyebilirsiniz.
                  </p>
                </div>
              ))}

            {activeTab === 'activity' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    isDarkMode
                      ? 'bg-gray-800 text-gray-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Activity size={32} />
                </div>
                <h3
                  className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Aktivite Geçmişi
                </h3>
                <p className="text-sm text-gray-500">
                  Yakında tüm okuma ve test geçmişin burada görünecek.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 4. ANA BİLEŞEN (APP) ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [expandedArticleId, setExpandedArticleId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [reportingArticle, setReportingArticle] = useState(null);
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
  });
  const [notification, setNotification] = useState(null);
  const [settings, setSettings] = useState({
    dailyLimit: 5,
    fontSize: 'medium',
  });
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isUsersLoaded, setIsUsersLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [viewingProfileUser, setViewingProfileUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [verificationCode, setVerificationCode] = useState(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleAutoGenerate = () => setIsAutoGenerating(!isAutoGenerating);
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== 'undefined' &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth failed', err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);
  // AUTO PILOT EFFECT
  useEffect(() => {
    let interval;
    if (isAutoGenerating) {
      interval = setInterval(async () => {
        const todayStr = new Date().toDateString();
        const dailyCount = articles.filter(
          (a) => new Date(a.date).toDateString() === todayStr
        ).length;

        if (dailyCount >= settings.dailyLimit) {
          setIsAutoGenerating(false);
          setNotification({
            message: 'Günlük otomatik üretim limiti doldu.',
            type: 'info',
          });
          return;
        }
        await handleGenerate();
      }, 30000);
    }

    return () => clearInterval(interval);
  }, [isAutoGenerating, articles, settings.dailyLimit]);
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubArticles = onSnapshot(
      collection(db, 'artifacts', NELSON_ID, 'public', 'data', 'articles'),
      (snapshot) => {
        setArticles(
          snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
        );
      }
    );

    // --- 1. KULLANICILARI HARRISON'DAN ÇEKİYORUZ (ORTAK HAVUZ) ---
    const unsubUsers = onSnapshot(
      collection(db, 'artifacts', HARRISON_ID, 'public', 'data', 'users'),
      (snapshot) => {
        const fetchedUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(fetchedUsers);

        // Hem Harrison hem Nelson ID'sini kontrol et (SSO Mantığı)
        const harrisonId = localStorage.getItem('harrison_user_id');
        const nelsonId = localStorage.getItem('nelson_user_id');
        const storedUserId = harrisonId || nelsonId;

        if (storedUserId && !currentUser) {
          const foundUser = fetchedUsers.find((u) => u.id == storedUserId);
          if (foundUser && !foundUser.isBanned) setCurrentUser(foundUser);
        }
        setIsUsersLoaded(true);
        setIsAuthChecking(false);
      }
    );

    // --- 2. RAPORLARI NELSON'DAN ÇEKİYORUZ (PEDİATRİYE ÖZEL) ---
    const unsubReports = onSnapshot(
      collection(db, 'artifacts', NELSON_ID, 'public', 'data', 'reports'),
      (snapshot) => {
        setReports(
          snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
        );
      }
    );

    // --- 3. LOGLARI NELSON'DAN ÇEKİYORUZ ---
    const unsubLogs = onSnapshot(
      query(
        collection(db, 'artifacts', NELSON_ID, 'public', 'data', 'logs'),
        orderBy('date', 'desc'),
        limit(50)
      ),
      (snapshot) => {
        setLogs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => {
      // unsubArticles burada tanımlı değilse useEffect'in üst kısmından geldiğini varsayıyorum
      if (typeof unsubArticles === 'function') unsubArticles();
      unsubUsers();
      unsubReports();
      unsubLogs();
    };
  }, [firebaseUser]);

  const showNotification = (msg, type = 'info') =>
    setNotification({ message: msg, type });

  // --- LOGLAMA İŞLEMİ (NELSON VERİTABANINA) ---
  const logAction = async (action) => {
    if (!currentUser) return;
    try {
      await addDoc(
        collection(db, 'artifacts', NELSON_ID, 'public', 'data', 'logs'),
        {
          user: currentUser.name,
          action: action,
          date: new Date().toISOString(),
        }
      );
    } catch (e) {
      console.error('Logging error', e);
    }
  };

  const handleLogin = (email, password, setError) => {
    // Users dizisi artık Harrison'dan geldiği için burası çalışır
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );
    if (foundUser && !foundUser.isBanned) {
      setCurrentUser(foundUser);
      // Harrison ID'sini kaydedelim ki diğer sitede de açık kalsın
      localStorage.setItem('harrison_user_id', foundUser.id);
      setIsLoginModalOpen(false);
      showNotification('Giriş yapıldı', 'success');
      logAction('Giriş yaptı');
    } else {
      setError('Hatalı bilgiler veya yasaklı hesap');
    }
  };

  const initiateRegister = (userData) => {
    if (users.some((u) => u.email === userData.email)) {
      showNotification('Bu mail adresi zaten kullanılıyor', 'error');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setPendingUser(userData);
    setIsLoginModalOpen(false);
    setIsVerificationModalOpen(true);
    showNotification(`E-posta gönderildi! Doğrulama Kodu: ${code}`, 'info');
  };

  // --- KAYIT İŞLEMİ (HARRISON VERİTABANINA - ORTAK HESAP) ---
  const verifyAndCreateAccount = async (enteredCode) => {
    if (enteredCode === verificationCode) {
      const newUser = {
        ...pendingUser,
        role: pendingUser.email === 'alperen@sivas.edu.tr' ? 'admin' : 'user',
        dateJoined: new Date().toISOString(),
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${pendingUser.name}`,
        isBanned: false,
      };
      try {
        // Yeni kullanıcıyı HARRISON veritabanına ekliyoruz
        const docRef = await addDoc(
          collection(db, 'artifacts', HARRISON_ID, 'public', 'data', 'users'),
          newUser
        );
        const userWithId = { ...newUser, id: docRef.id };
        await updateDoc(
          doc(
            db,
            'artifacts',
            HARRISON_ID,
            'public',
            'data',
            'users',
            docRef.id
          ),
          { id: docRef.id }
        );
        setCurrentUser(userWithId);
        localStorage.setItem('harrison_user_id', userWithId.id); // Ortak ID
        setIsVerificationModalOpen(false);
        showNotification('Hesap oluşturuldu', 'success');
        logAction('Yeni üye kaydı');
      } catch (e) {
        showNotification('Kayıt hatası', 'error');
      }
    } else {
      showNotification('Hatalı kod!', 'error');
    }
  };

  // --- BAN İŞLEMİ (HARRISON VERİTABANINDA) ---
  const handleBanUser = async (userToBan) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    setConfirmModal({
      isOpen: true,
      message: `${userToBan.name} kullanıcısının hesabı ${
        userToBan.isBanned ? 'açılacak' : 'askıya alınacak'
      }. Onaylıyor musunuz?`,
      onConfirm: async () => {
        try {
          await updateDoc(
            doc(
              db,
              'artifacts',
              HARRISON_ID, // Kullanıcı Harrison'da olduğu için orayı güncelliyoruz
              'public',
              'data',
              'users',
              userToBan.id
            ),
            { isBanned: !userToBan.isBanned }
          );
          showNotification('İşlem başarılı', 'success');
        } catch (error) {
          showNotification('Hata oluştu', 'error');
        }
      },
    });
  };

  const handleViewProfile = (userId) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setViewingProfileUser(targetUser);
      setActiveTab('profile_view');
    }
  };

  // --- PROFİL GÜNCELLEME (HARRISON VERİTABANINDA) ---
  const handleUpdateProfile = async (updatedData) => {
    if (!currentUser) return;
    try {
      await updateDoc(
        doc(
          db,
          'artifacts',
          HARRISON_ID,
          'public',
          'data',
          'users',
          currentUser.id
        ),
        updatedData
      );
      setCurrentUser({ ...currentUser, ...updatedData });
      setIsEditProfileModalOpen(false);
      showNotification('Profil güncellendi', 'success');
      logAction('Profilini güncelledi');
    } catch (error) {
      showNotification('Hata oluştu', 'error');
    }
  };

  // --- İÇERİK ÜRETİMİ (NELSON VERİTABANINA) ---
  const handleGenerate = async (specificTopic = null) => {
    if (!isAutoGenerating) setIsGenerating(true);
    const aiContent = await generateMedicalContent(
      selectedCategory,
      specificTopic
    );
    if (aiContent) {
      const imagePrompt = `${aiContent.title} pathology, medical diagram, pediatric context`;
      const aiImage = await generateMedicalImage(imagePrompt);
      const compressedImage = aiImage ? await compressImage(aiImage) : null;
      const newArticle = {
        ...aiContent,
        image: compressedImage,
        date: new Date().toISOString(),
        likes: [],
        comments: [],
        views: 0,
      };
      // Makaleleri NELSON'a ekliyoruz
      await addDoc(
        collection(db, 'artifacts', NELSON_ID, 'public', 'data', 'articles'),
        newArticle
      );
      if (!isAutoGenerating) showNotification('Kaydedildi', 'success');
      logAction(`Yeni içerik: ${newArticle.title}`);
    }
    setIsGenerating(false);
  };

  const handleGenerateQuiz = async (article) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    showNotification('Soru hazırlanıyor...', 'info');
    const quiz = await generateQuizQuestion(article.title, article.content);
    if (quiz) {
      setQuizData(quiz);
      setIsQuizModalOpen(true);
    } else {
      showNotification('Soru oluşturulamadı.', 'error');
    }
  };

  // --- BOOKMARK (HARRISON KULLANICISINA EKLENİR) ---
  const handleBookmark = async (articleId) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    const bookmarks = currentUser.bookmarks || [];
    const newBookmarks = bookmarks.includes(articleId)
      ? bookmarks.filter((id) => id !== articleId)
      : [...bookmarks, articleId];

    // Kullanıcı Harrison'da olduğu için orayı güncelliyoruz
    await updateDoc(
      doc(
        db,
        'artifacts',
        HARRISON_ID,
        'public',
        'data',
        'users',
        currentUser.id
      ),
      { bookmarks: newBookmarks }
    );
    setCurrentUser({ ...currentUser, bookmarks: newBookmarks });
    showNotification(
      bookmarks.includes(articleId) ? 'Çıkarıldı' : 'Kaydedildi',
      'success'
    );
  };

  // --- BEĞENİ (NELSON MAKALELERİNE EKLENİR) ---
  const handleLike = async (id) => {
    if (!currentUser) return;
    const article = articles.find((a) => a.id === id);
    const likes = article.likes || [];
    const newLikes = likes.includes(currentUser.id)
      ? likes.filter((uid) => uid !== currentUser.id)
      : [...likes, currentUser.id];

    // Makale Nelson'da olduğu için orayı güncelliyoruz
    await updateDoc(
      doc(db, 'artifacts', NELSON_ID, 'public', 'data', 'articles', id),
      { likes: newLikes }
    );
  };

  // --- YORUM (NELSON MAKALELERİNE EKLENİR) ---
  const handleComment = async (id, text) => {
    if (!currentUser) return;
    const article = articles.find((a) => a.id === id);
    const newComment = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      user: currentUser.name,
      text,
      date: new Date().toISOString(),
      replies: [],
    };
    await updateDoc(
      doc(db, 'artifacts', NELSON_ID, 'public', 'data', 'articles', id),
      { comments: [...(article.comments || []), newComment] }
    );
    logAction(`Yorum yaptı: ${article.title}`);
  };

  const handleReply = async (articleId, commentId, text) => {
    if (!currentUser) return;
    const article = articles.find((a) => a.id === articleId);
    const newComments = article.comments.map((c) =>
      c.id === commentId
        ? {
            ...c,
            replies: [
              ...(c.replies || []),
              {
                id: crypto.randomUUID(),
                userId: currentUser.id,
                user: currentUser.name,
                text,
                date: new Date().toISOString(),
              },
            ],
          }
        : c
    );
    await updateDoc(
      doc(db, 'artifacts', NELSON_ID, 'public', 'data', 'articles', articleId),
      { comments: newComments }
    );
    showNotification('Yanıtlandı', 'success');
  };

  const handleDeleteComment = async (articleId, commentId, replyId = null) => {
    setConfirmModal({
      isOpen: true,
      message: 'Silmek istediğinize emin misiniz?',
      onConfirm: async () => {
        const article = articles.find((a) => a.id === articleId);
        let newComments = article.comments;
        if (replyId)
          newComments = newComments.map((c) =>
            c.id === commentId
              ? { ...c, replies: c.replies.filter((r) => r.id !== replyId) }
              : c
          );
        else newComments = newComments.filter((c) => c.id !== commentId);

        await updateDoc(
          doc(
            db,
            'artifacts',
            NELSON_ID,
            'public',
            'data',
            'articles',
            articleId
          ),
          { comments: newComments }
        );
        showNotification('Silindi', 'info');
      },
    });
  };

  // --- MAKALE SİLME (NELSON'DAN) ---
  const handleDeleteArticle = async (articleId, skipConfirm = false) => {
    const doDelete = async () => {
      await deleteDoc(
        doc(db, 'artifacts', NELSON_ID, 'public', 'data', 'articles', articleId)
      );
      showNotification('İçerik Silindi', 'info');
    };

    if (skipConfirm) {
      doDelete();
    } else {
      setConfirmModal({
        isOpen: true,
        message: 'İçeriği kalıcı olarak silmek istiyor musunuz?',
        onConfirm: doDelete,
      });
    }
  };

  const handleEditClick = (article) => {
    setEditingArticle(article);
    setIsEditModalOpen(true);
  };

  // --- MAKALE GÜNCELLEME (NELSON) ---
  const handleSaveArticle = async (updatedArticle) => {
    try {
      await updateDoc(
        doc(
          db,
          'artifacts',
          NELSON_ID,
          'public',
          'data',
          'articles',
          updatedArticle.id
        ),
        updatedArticle
      );
      showNotification('Güncellendi', 'success');
    } catch (error) {
      showNotification('Hata oluştu', 'error');
    }
    setIsEditModalOpen(false);
  };

  const openReportModal = (article) => {
    setReportingArticle(article);
    setIsReportModalOpen(true);
  };

  // --- RAPOR GÖNDERME (NELSON) ---
  const handleSubmitReport = (text) => {
    if (!currentUser) return;
    addDoc(
      collection(db, 'artifacts', NELSON_ID, 'public', 'data', 'reports'),
      {
        articleTitle: reportingArticle ? reportingArticle.title : 'Genel',
        user: currentUser.name,
        issue: text,
        status: 'pending',
        date: new Date().toISOString(),
      }
    ).then(() => {
      showNotification('Bildirildi', 'success');
      setIsReportModalOpen(false);
    });
  };

  // --- MAKALE ONAYI (NELSON) ---
  const handleVerifyContent = async (article) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    await updateDoc(
      doc(db, 'artifacts', NELSON_ID, 'public', 'data', 'articles', article.id),
      { isVerified: !article.isVerified }
    );
    showNotification(
      article.isVerified ? 'Onay kaldırıldı' : 'Onaylandı',
      'success'
    );
  };

  const handleViewIncrement = async (articleId) => {
    const article = articles.find((a) => a.id === articleId);
    await updateDoc(
      doc(db, 'artifacts', NELSON_ID, 'public', 'data', 'articles', articleId),
      { views: (article?.views || 0) + 1 }
    );
  };

  // --- AI FEATURE HANDLERS (Inside App for Scope Access) ---
  const handleShare = async (article) => {
    const shareText = `${article.title}\n\n${article.content?.definition}\n\nNelson Daily'de daha fazlasını okuyun.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: shareText,
          url: window.location.href,
        });
        showNotification('Paylaşıldı!', 'success');
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      try {
        const el = document.createElement('textarea');
        el.value = shareText;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        showNotification('İçerik panoya kopyalandı!', 'success');
      } catch (err) {
        showNotification('Paylaşım desteklenmiyor', 'error');
      }
    }
  };

  const filteredArticles = articles.filter(
    (a) =>
      (selectedCategory === 'Tümü' || a.category === selectedCategory) &&
      a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (isAuthChecking)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  return (
    <div
      className={`min-h-screen font-sans ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      } transition-colors duration-200`}
    >
      <Header
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentUser={currentUser}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={() => {
          setCurrentUser(null);
          localStorage.removeItem('nelson_user_id');
        }}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      <div className="flex max-w-7xl mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(false)}
          currentUser={currentUser}
          unreadReports={reports.filter((r) => r.status === 'pending').length}
          isDarkMode={isDarkMode}
        />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                  title="Kullanıcılar"
                  value={users.length}
                  subtext="Toplam Üye"
                  icon={User}
                  color="bg-indigo-500"
                  isDarkMode={isDarkMode}
                />
                <StatsCard
                  title="İçerikler"
                  value={articles.length}
                  subtext="Veritabanı"
                  icon={FileText}
                  color="bg-blue-500"
                  isDarkMode={isDarkMode}
                />

                <StatsCard
                  title="Bildirim"
                  value={reports.filter((r) => r.status === 'pending').length}
                  subtext="Bekleyen"
                  icon={AlertTriangle}
                  color="bg-red-500"
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          )}

          {activeTab === 'articles' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Arşiv
                </h2>

                <div className="flex items-center gap-2">
                  {/* Görünüm Değiştirici Butonlar */}
                  <div
                    className={`flex p-1 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === 'grid'
                          ? isDarkMode
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-100 text-gray-900'
                          : 'text-gray-400'
                      }`}
                      title="Kart Görünümü"
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === 'table'
                          ? isDarkMode
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-100 text-gray-900'
                          : 'text-gray-400'
                      }`}
                      title="Liste Görünümü (Yönetim)"
                    >
                      <LayoutList size={18} />
                    </button>
                  </div>

                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => setActiveTab('generator')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2 text-sm font-bold shadow-md hover:bg-blue-700"
                    >
                      <Plus size={18} />{' '}
                      <span className="hidden sm:inline">Yeni Üret</span>
                    </button>
                  )}
                </div>
              </div>

              <input
                type="text"
                className={`w-full pl-4 pr-4 py-3 border rounded-xl mb-6 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Vaka veya hastalık ara..."
              />

              <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm border transition-all ${
                      selectedCategory === c
                        ? 'bg-blue-600 text-white border-blue-600'
                        : isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* GÖRÜNÜM MODUNA GÖRE DEĞİŞEN İÇERİK */}
              {viewMode === 'table' && currentUser?.role === 'admin' ? (
                <AdminContentPanel
                  articles={filteredArticles}
                  onDelete={(id) => handleDeleteArticle(id, true)} // true = onay sormadan sil (toplu silme onayı zaten var)
                  onVerify={handleVerifyContent}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <div className="space-y-6">
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      expanded={expandedArticleId === article.id}
                      toggleExpand={() =>
                        setExpandedArticleId(
                          expandedArticleId === article.id ? null : article.id
                        )
                      }
                      onLike={() => handleLike(article.id)}
                      onComment={handleComment}
                      onReply={handleReply}
                      onDeleteComment={handleDeleteComment}
                      onDelete={() => handleDeleteArticle(article.id)}
                      onEdit={handleEditClick}
                      onReport={openReportModal}
                      onBookmark={() => handleBookmark(article.id)}
                      onQuiz={handleGenerateQuiz}
                      onViewProfile={handleViewProfile}
                      onShare={handleShare}
                      onVerify={handleVerifyContent}
                      onView={handleViewIncrement}
                      currentUser={currentUser}
                      onLoginRequest={() => setIsLoginModalOpen(true)}
                      fontSize={settings.fontSize}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'settings' && currentUser?.role === 'admin' && (
            <SettingsView
              settings={settings}
              setSettings={setSettings}
              isDarkMode={isDarkMode}
            />
          )}
          {activeTab === 'generator' && currentUser?.role === 'admin' && (
            <GeneratorPanel
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              dailyLimit={settings.dailyLimit}
              currentCount={
                articles.filter(
                  (a) =>
                    new Date(a.date).toDateString() ===
                    new Date().toDateString()
                ).length
              }
              isAutoGenerating={isAutoGenerating}
              toggleAutoGenerate={toggleAutoGenerate}
            />
          )}
          {activeTab === 'users' && currentUser?.role === 'admin' && (
            <UsersPanel
              users={users}
              onBan={handleBanUser}
              isDarkMode={isDarkMode}
            />
          )}
          {activeTab === 'logs' && currentUser?.role === 'admin' && (
            <LogsPanel logs={logs} />
          )}
          {activeTab === 'reports' && currentUser?.role === 'admin' && (
            <ReportsPanel
              reports={reports}
              onResolve={async (id) => {
                await updateDoc(
                  doc(
                    db,
                    'artifacts',
                    NELSON_ID,
                    'public',
                    'data',
                    'reports',
                    id
                  ),
                  { status: 'resolved' }
                );
              }}
            />
          )}
          {activeTab === 'profile' && currentUser && (
            <ProfileView
              user={currentUser}
              articles={articles}
              onEditProfile={() => setIsEditProfileModalOpen(true)}
              isDarkMode={isDarkMode}
            />
          )}
          {activeTab === 'profile_view' && viewingProfileUser && (
            <ProfileView
              user={viewingProfileUser}
              articles={articles}
              onEditProfile={null}
              isDarkMode={isDarkMode}
            />
          )}
        </main>
      </div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        onRegister={initiateRegister}
      />
      <VerificationModal
        isOpen={isVerificationModalOpen}
        email={pendingUser?.email}
        onClose={() => setIsVerificationModalOpen(false)}
        onVerify={verifyAndCreateAccount}
        isDarkMode={isDarkMode}
      />
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        user={currentUser}
        onSave={handleUpdateProfile}
        isDarkMode={isDarkMode}
      />
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleSubmitReport}
        articleTitle={reportingArticle?.title}
      />
      <EditArticleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        article={editingArticle}
        onSave={handleSaveArticle}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        isDarkMode={isDarkMode}
      />
      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        quizData={quizData}
        isDarkMode={isDarkMode}
      />
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
