import { useState, useEffect } from 'react';
import axios from 'axios';

// @ts-ignore
const tg = window.Telegram?.WebApp;
const BASE_URL = 'https://kelajak-bot-api.onrender.com'; 

export default function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Xatoliklar uchun
  
  const [question, setQuestion] = useState<any>(null);
  const [testFinished, setTestFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const userName = tg?.initDataUnsafe?.user?.first_name || "Do'stim";
  const telegramId = tg?.initDataUnsafe?.user?.id?.toString() || "test_user_123";

  const startAssessment = async () => {
    setLoading(true); 
    setError('');
    try {
      await axios.post(`${BASE_URL}/users`, { telegram_id: telegramId, full_name: userName }).catch(() => {});
      const res = await axios.get(`${BASE_URL}/questions/first`);
      setQuestion(res.data);
      setStep(4);
    } catch (err) {
      setError("Tizim ulanishida xatolik. Iltimos sahifani yangilang.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = async (ans: any) => {
    if (ans.next_question_id) {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${BASE_URL}/questions/${ans.next_question_id}`);
        setQuestion(res.data);
      } catch (err) {
        setError('Keyingi savolni yuklashda xato.');
      } finally {
        setLoading(false);
      }
    } else {
      setTestFinished(true);
      const resultsMap: Record<number, any> = {
        1: { 
          fitrat_type: "Tizimli Arxitektor (Texnik)", 
          description: "Siz mantiq, raqamlar va aniqlikni yoqtirasiz. Katta tizimlarni tahlil qilish va ulardagi muammolarni yechish sizning fitratingizga xos.", 
          top_professions: ["IT va Dasturlash", "Moliya, Iqtisod va Tahlil", "Murakkab Muhandislik"] 
        },
        2: { 
          fitrat_type: "Ijtimoiy Bog'lovchi (Gumanitar)", 
          description: "Siz insonlar bilan ishlashda, ularni tinglash va ilhomlantirishda beqiyossiz. Ta'sir doirangiz va so'zlashuv san'atingiz juda kuchli.", 
          top_professions: ["Psixologiya, Kadrlar (HR)", "Media, San'at va Jurnalistika", "Ta'lim va Murabbiylik"] 
        },
        3: { 
          fitrat_type: "Strategik Yetakchi (Boshqaruv)", 
          description: "Sizda jamoani orqadan ergashtirish, mas'uliyatni o'z bo'yningizga olish va yirik maqsadlar sari strategiya tuzish qobiliyati bor.", 
          top_professions: ["Biznes va Tadbirkorlik", "Boshqaruv (Menejment)", "Marketing va PR"] 
        },
        4: { 
          fitrat_type: "Amaliy Usta (Tabiat va Hunar)", 
          description: "Siz quruq nazariyadan ko'ra, amaliy natijalarni ko'rishni, o'z qo'lingiz, kuchingiz yoki didingiz bilan aniq qadriyat yaratishni xohlaysiz.", 
          top_professions: ["Arxitektura va Dizayn", "Yer va Tabiat (Agronomiya)", "Amaliy Hunar, Texnika va Sport"] 
        }
      };

      const traitKey = ans.trait_score ? Number(ans.trait_score) : 1;
      setFinalResult(resultsMap[traitKey] || resultsMap[1]);

      axios.post(`${BASE_URL}/results`, { telegram_id: telegramId, full_name: userName, answers: [ans.id] }).catch(console.error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    tg?.showAlert("Karta raqami nusxalandi! 📋");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center justify-center p-6 transition-colors duration-300">
      
      {/* 1, 2, 3 va Savollar qismi */}
      {step === 1 && (
        <div className="text-center w-full max-w-md animate-fade-in">
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">Assalamu alaykum, {userName}!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">Trendlarga emas, o'z fitriy iqtidoringizga mos kasbni topishga tayyormisiz?</p>
          <button onClick={() => setStep(2)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl w-full transition-transform active:scale-95">Keyingisi</button>
        </div>
      )}

      {step === 2 && (
        <div className="text-center w-full max-w-md animate-fade-in">
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">Bor-yo'g'i 3 daqiqa</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">Sizga eng mos keladigan holatni tanlang. O'ylab o'tirmang, ilk xayolga kelganini belgilang!</p>
          <button onClick={() => setStep(3)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl w-full transition-transform active:scale-95">Tushunarli</button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center w-full max-w-md animate-fade-in">
          <h1 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">Bismillah!</h1>
          <button onClick={startAssessment} disabled={loading} className={`${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-4 px-8 rounded-xl w-full text-xl shadow-lg transition-transform active:scale-95`}>
            {loading ? 'Ulanmoqda...' : '🚀 Testni boshladik!'}
          </button>
          {error && <p className="text-red-500 mt-4 font-bold">{error}</p>}
        </div>
      )}

      {step === 4 && !testFinished && question && (
        <div className="text-center w-full max-w-md animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 leading-tight">{question.text}</h2>
          <div className="flex flex-col gap-4">
            {question.answers?.map((ans: any) => (
              <button key={ans.id} onClick={() => handleAnswerClick(ans)} disabled={loading} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 text-gray-800 dark:text-gray-200 p-4 rounded-xl text-left transition-all active:scale-95 shadow-sm text-lg font-medium">
                {ans.text}
              </button>
            ))}
          </div>
          {error && <p className="text-red-500 mt-4 font-bold">{error}</p>}
        </div>
      )}

      {/* NATIJA VA KASSA OYNASI */}
      {step === 4 && testFinished && finalResult && (
        <div className="text-center w-full max-w-md animate-fade-in">
          
          {!showCheckout ? (
            <>
              <h1 className="text-3xl font-bold text-gray-500 dark:text-gray-400 mb-2">Sizning fitratingiz:</h1>
              <h2 className="text-2xl font-black text-green-600 dark:text-green-400 mb-6">{finalResult.fitrat_type}</h2>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 mb-8 text-left">
                <p className="text-gray-600 dark:text-gray-300 mb-4">"{finalResult.description}"</p>
                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">🔥 Eng mos keluvchi 3 ta soha:</h3>
                <ul className="space-y-2 mb-2">
                  {finalResult.top_professions?.map((prof: string, idx: number) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300 font-medium">✅ {prof}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl mb-6 border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200 font-medium mb-3">Bu kasblarni qanday egallash va qayerda o'qish haqida to'liq Shaxsiy Yo'l Xaritasini (Roadmap) oling!</p>
                <button onClick={() => setShowCheckout(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl w-full shadow-lg transition-transform active:scale-95 animate-pulse">
                  Yo'l xaritasini olish (39 000 so'm)
                </button>
              </div>
              <button onClick={() => tg?.close()} className="text-gray-500 underline mt-2">Shunchaki yopish</button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">💳 To'lovni amalga oshirish</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">O'zingizga qulay karta raqamiga <b>39 000 so'm</b> o'tkazing va to'lov chekini botga yuboring.</p>
              
              <div className="space-y-4 mb-8 text-left">
                {/* UZCARD */}
                <div onClick={() => copyToClipboard('8600330485084287')} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow cursor-pointer border border-green-200 hover:border-green-500 transition-colors">
                  <p className="text-sm text-gray-500 mb-1">Uzcard (Tursunova Muhabbat)</p>
                  <p className="font-mono text-lg font-bold text-gray-800 dark:text-white">8600 3304 8508 4287 📋</p>
                </div>
                
                {/* HUMO (Tez kunda) */}
                <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 opacity-70">
                  <p className="text-sm text-gray-500 mb-1">Humo</p>
                  <p className="font-mono text-lg font-bold text-gray-500 dark:text-gray-400">Tez kunda... ⏳</p>
                </div>
                
                {/* VISA */}
                <div onClick={() => copyToClipboard('4466136951651026')} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow cursor-pointer border border-green-200 hover:border-green-500 transition-colors">
                  <p className="text-sm text-gray-500 mb-1">Visa (Tursunova Muxabbat)</p>
                  <p className="font-mono text-lg font-bold text-gray-800 dark:text-white">4466 1369 5165 1026 📋</p>
                </div>
              </div>

              <button onClick={() => { tg?.showAlert("Chekni to'g'ridan-to'g'ri botga yozib yuboring!"); tg?.close(); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl w-full text-xl shadow-lg transition-transform active:scale-95">
                ✅ To'lov qildim, chekni yuborish
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}