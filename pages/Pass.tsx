import React from 'react';
import { Ticket, Sparkles, Plus, CheckCircle, XCircle, AlertTriangle, History, QrCode, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { PASS_PACKAGES } from '../constants';
import { PassPackage } from '../types';

export const FamilyPassPage = () => {
  const { t, toggleModal, openPayment, userData, user, myChildren, buyPass } = useAppContext();
  
  const pass = userData?.kidspacePass || {
    status: 'inactive',
    planName: 'Нет подписки',
    balance: 0,
    totalVisits: 0,
    permissions: { playgrounds: false, masterclasses: false, sections: false },
    expiryDate: '-'
  };

  const handleBuy = (pkg: PassPackage) => {
    openPayment({
      amount: pkg.price,
      title: `KidSpace Pass: ${pkg.name}`,
      description: `${pkg.visits} посещений. Действует 30 дней.`,
      type: 'Subscription',
      onSuccess: async () => {
        const result = await buyPass(pkg);
        if (!result.success) {
          console.error(result.message);
        }
      }
    });
  };

  const handleBookVisit = () => {
    toggleModal('scan');
  }

  // Filter usage history
  const usageHistory = userData?.history?.filter((h: any) => h.type === 'booking').slice(0, 3) || [];

  if (!user) return null;

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
       <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-extrabold text-secondary flex items-center"><Ticket className="mr-2" /> KidSpace Pass</h1>
          <button className="text-xs font-bold text-gray-400">Правила</button>
       </div>
       
       {/* Main Card */}
       <div className="bg-gradient-to-br from-secondary to-pink-600 rounded-3xl p-6 text-white shadow-xl mb-6 relative overflow-hidden group">
          <div className="relative z-10">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <p className="text-pink-100 text-xs font-bold mb-1 uppercase tracking-wider">{t('currentPlan')}</p>
                   <h2 className="text-3xl font-extrabold tracking-tight">{pass?.planName}</h2>
                </div>
                <div className={`backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/30 flex items-center ${pass?.status === 'active' ? 'bg-green-400/20 text-white' : 'bg-red-400/20 text-red-100'}`}>
                   {pass?.status === 'active' ? t('active') : t('inactive')}
                </div>
             </div>
             
             {/* Permissions */}
             <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { key: 'playgrounds', label: 'Игровые зоны' },
                  { key: 'masterclasses', label: 'Мастер-классы' },
                  { key: 'sections', label: 'Секции' }
                ].map((perm) => {
                   const isAllowed = pass?.permissions ? pass.permissions[perm.key as keyof typeof pass.permissions] : false;
                   return (
                      <span key={perm.key} className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center transition-colors ${
                         isAllowed 
                            ? 'bg-white/20 border-white/30 text-white' 
                            : 'bg-black/10 border-white/10 text-white/50'
                      }`}>
                         {isAllowed ? <CheckCircle size={12} className="mr-1.5 text-green-300"/> : <XCircle size={12} className="mr-1.5 text-red-300"/>} 
                         {perm.label}
                      </span>
                   );
                })}
             </div>

             {/* Progress Bar */}
             <div className="mb-6">
                <div className="flex justify-between text-xs font-bold mb-2 opacity-90">
                   <span>Осталось визитов</span>
                   <span className="text-lg">{pass?.balance} <span className="text-sm font-normal opacity-70">/ {pass?.totalVisits}</span></span>
                </div>
                <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden mb-2">
                   <div 
                      className={`h-full rounded-full transition-all duration-1000 ${pass?.balance && pass.balance < 3 ? 'bg-red-400' : 'bg-white'}`}
                      style={{ width: `${((pass?.balance || 0) / (pass?.totalVisits || 1)) * 100}%` }}
                   ></div>
                </div>
                <p className="text-[10px] text-pink-100 opacity-80">Действует до {pass?.expiryDate}</p>
             </div>

             {/* Warnings */}
             {pass?.balance && pass.balance < 3 && (
                <div className="bg-red-500/20 border border-red-200/30 rounded-xl p-2 mb-4 flex items-center animate-pulse">
                   <AlertTriangle size={16} className="text-red-200 mr-2 shrink-0"/>
                   <p className="text-[10px] font-bold">Баланс заканчивается! Пополните сейчас, чтобы сохранить остаток.</p>
                </div>
             )}

             <div className="grid grid-cols-2 gap-3">
               <button onClick={handleBookVisit} className="bg-white text-secondary font-bold py-3 rounded-xl shadow-lg hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center">
                  <QrCode size={18} className="mr-2"/> Вход
               </button>
               <button className="bg-white/10 text-white font-bold py-3 rounded-xl border border-white/30 hover:bg-white/20 transition-all">
                  Продлить
               </button>
             </div>
          </div>
          <Sparkles className="absolute top-0 right-0 w-48 h-48 text-white/10 -mr-10 -mt-10 animate-spin-slow" />
       </div>

       {/* Linked Children */}
       <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
             <h3 className="font-bold text-gray-800">{t('linkedChildren')}</h3>
             <button className="text-primary text-xs font-bold flex items-center"><Plus size={14} className="mr-1"/> {t('add')}</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
             {myChildren.map(child => (
                <div key={child.id} className="flex items-center bg-white p-2 pr-4 rounded-full shadow-sm border border-gray-100 shrink-0">
                   <img src={child.image} className="w-10 h-10 rounded-full mr-3 border border-gray-100" alt={child.name} />
                   <div>
                      <span className="font-bold text-sm text-gray-800 block">{child.name}</span>
                      <span className="text-[10px] text-gray-500">{child.age} лет</span>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* Recent Activity */}
       <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center"><History size={16} className="mr-2 text-gray-400"/> История Визитов</h3>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
             {usageHistory.length > 0 ? (
                usageHistory.map((item, idx) => (
                   <div key={item.id} className={`p-4 flex items-center justify-between ${idx !== usageHistory.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex items-center">
                         <div className="bg-blue-50 p-2 rounded-full text-blue-500 mr-3">
                            <Ticket size={16}/>
                         </div>
                         <div>
                            <p className="font-bold text-xs text-gray-800">{item.description}</p>
                            <p className="text-[10px] text-gray-400">{item.date}</p>
                         </div>
                      </div>
                      <span className="text-xs font-bold text-red-500">-1</span>
                   </div>
                ))
             ) : (
                <p className="p-4 text-center text-gray-400 text-xs">История пуста</p>
             )}
          </div>
       </div>

       {/* Packages List */}
       <h3 className="font-bold text-gray-800 mb-4">{t('choosePackage')}</h3>
       <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-4 text-xs text-indigo-800">
          💡 Неиспользованные визиты переносятся на следующий месяц при своевременном продлении.
       </div>
       <div className="space-y-4">
          {PASS_PACKAGES.map(pkg => (
             <div key={pkg.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden group">
                {pkg.popular && (
                   <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-orange-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                      ХИТ
                   </div>
                )}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${pkg.color}`}></div>
                <div className="flex justify-between items-center pl-3">
                   <div>
                      <h4 className="font-bold text-lg text-gray-900">{pkg.name}</h4>
                      <p className="text-gray-500 text-xs mb-2">{pkg.description}</p>
                      <div className={`text-xs font-bold px-2 py-0.5 rounded w-fit text-white bg-gradient-to-r ${pkg.color}`}>
                         {pkg.visits} {t('visitsCount')}
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xl font-extrabold text-primary">{pkg.price.toLocaleString()} <span className="text-xs font-bold text-gray-400">UZS</span></p>
                      <button 
                         onClick={() => handleBuy(pkg)}
                         className="mt-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center ml-auto"
                      >
                         Купить <ArrowRight size={14} className="ml-1"/>
                      </button>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};