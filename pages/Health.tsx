import React from 'react';
import { HeartPulse, Video, MessageCircle, Star, Clock, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Doctor } from '../types';

export const HealthPage = () => {
  const { openChat, openChatWith, openPayment, userData, doctors, buyHealthPass, startConsultation } = useAppContext();
  
  const healthPass = userData?.healthPass || {
    isActive: false,
    planName: 'Базовый',
    limit: 0,
    used: 0,
    expiryDate: 'Нет активной подписки'
  };

  const handleBuyHealthPass = () => {
    openPayment({
      amount: 150000, // Example price
      title: 'Подписка Health+',
      description: '10 консультаций в месяц, приоритетная поддержка',
      type: 'Subscription',
      onSuccess: async () => {
        await buyHealthPass(150000);
      }
    });
  };

  const handlePaidConsultation = (doctor: Doctor, type: 'chat' | 'video') => {
    // If user has active Health+ and remaining consultations, use it
    if (healthPass.isActive && healthPass.used < healthPass.limit) {
      startConsultation(doctor, type);
      openChatWith('doctor', doctor);
      return;
    }

    const price = type === 'video' ? doctor.price * 1.5 : doctor.price;
    openPayment({
      amount: price,
      title: type === 'video' ? 'Видеоконсультация' : 'Чат с врачом',
      description: `${doctor.name} (${doctor.specialty})`,
      type: 'Consultation',
      onSuccess: async () => {
        await startConsultation(doctor, type);
        openChatWith('doctor', doctor);
      }
    });
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-extrabold text-teal-600 flex items-center"><HeartPulse className="mr-2"/> Health+</h1>
         <button className="text-xs font-bold text-gray-400">Моя медкарта</button>
      </div>

      {/* Health Pass Subscription Card */}
      <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="text-teal-100 text-xs font-bold mb-1 uppercase tracking-wider">Текущий тариф</p>
                  <h2 className="text-2xl font-extrabold tracking-tight">{healthPass.planName || 'Базовый'}</h2>
               </div>
               <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                  {healthPass.isActive ? 'Активен' : 'Неактивен'}
               </div>
            </div>
            
            {/* Consultation Limits */}
            <div className="mb-4">
               <div className="flex justify-between text-xs font-bold mb-2 opacity-90">
                  <span>Консультации</span>
                  <span className="text-lg">{healthPass.limit - healthPass.used} <span className="text-sm font-normal opacity-70">/ {healthPass.limit}</span></span>
               </div>
               <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden mb-2">
                  <div 
                     className="h-full bg-white rounded-full transition-all duration-1000"
                     style={{ width: healthPass.limit > 0 ? `${((healthPass.limit - healthPass.used) / healthPass.limit) * 100}%` : '0%' }}
                  ></div>
               </div>
               <p className="text-[10px] text-teal-100 opacity-80">Обновление: {healthPass.expiryDate}</p>
            </div>

            {!healthPass.isActive && (
               <button 
                  onClick={handleBuyHealthPass}
                  className="w-full bg-white text-teal-600 font-bold py-2 rounded-xl text-sm shadow-lg hover:bg-teal-50 transition-colors"
               >
                  Подключить Health+
               </button>
            )}
         </div>
         <HeartPulse className="absolute top-0 right-0 w-40 h-40 text-white/10 -mr-8 -mt-8 rotate-12" />
      </div>

      {/* AI Triage Button */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8 flex items-center justify-between shadow-sm">
         <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-3">
               <AlertCircle size={24} />
            </div>
            <div>
               <h3 className="font-bold text-gray-800 text-sm">Симптом-чекер</h3>
               <p className="text-xs text-gray-500">AI-оценка за 30 секунд</p>
            </div>
         </div>
         <button 
           onClick={() => openChat("У ребенка температура и кашель. Что делать?")}
           className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-blue-700 transition-colors"
         >
           Начать
         </button>
      </div>

      {/* Doctors List */}
      <div className="mb-8">
         <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
            <span>Врачи Онлайн</span>
            <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg">24/7 Доступно</span>
         </h3>
         <div className="space-y-4">
            {doctors.map(doc => (
               <div key={doc.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start mb-3">
                     <div className="relative mr-4">
                        <img src={doc.image} className="w-14 h-14 rounded-full object-cover border-2 border-gray-50" alt={doc.name} />
                        {doc.isOnline && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>}
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <h4 className="font-bold text-gray-900">{doc.name}</h4>
                           <div className="flex items-center text-amber-500 text-xs font-bold">
                              <Star size={12} className="fill-amber-500 mr-1"/> {doc.rating}
                           </div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mb-1">{doc.specialty} • Стаж {doc.experience} лет</p>
                        <p className="text-[10px] text-gray-400 flex items-center"><Clock size={10} className="mr-1"/> Отвечает за 5 мин</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <button 
                       onClick={() => handlePaidConsultation(doc, 'chat')}
                       disabled={!doc.isOnline}
                       className={`flex items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-colors ${doc.isOnline ? 'bg-teal-50 text-teal-700 hover:bg-teal-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                     >
                        <MessageCircle size={16} className="mr-2"/> Чат
                     </button>
                     <button 
                       onClick={() => handlePaidConsultation(doc, 'video')}
                       className="flex items-center justify-center py-2.5 rounded-xl text-xs font-bold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                     >
                        <Video size={16} className="mr-2"/> Видео
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* History */}
      <div>
         <h3 className="font-bold text-gray-800 mb-4">История консультаций</h3>
         <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {healthPass.history && healthPass.history.length > 0 ? (
               healthPass.history.map((record: any, idx: number) => (
                  <div key={record.id} className={`p-4 hover:bg-gray-50 transition-colors ${idx !== healthPass.history.length - 1 ? 'border-b border-gray-50' : ''}`}>
                     <div className="flex justify-between items-start mb-2">
                        <div>
                           <p className="font-bold text-sm text-gray-800">{record.doctorName}</p>
                           <p className="text-[10px] text-gray-400">{record.date} • {record.type === 'video' ? 'Видеосвязь' : 'Чат'}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">Завершен</span>
                     </div>
                     {record.recommendation && (
                        <div className="bg-gray-50 p-2 rounded-lg flex items-start mt-2">
                           <FileText size={14} className="text-gray-400 mr-2 mt-0.5 shrink-0"/>
                           <p className="text-xs text-gray-600 line-clamp-2">{record.recommendation}</p>
                        </div>
                     )}
                     <button className="text-teal-600 text-[10px] font-bold mt-2 flex items-center hover:underline">
                        Подробнее <ChevronRight size={10} className="ml-1"/>
                     </button>
                  </div>
               ))
            ) : (
               <div className="p-8 text-center text-gray-400 text-sm">История пуста</div>
            )}
         </div>
      </div>
    </div>
  );
};