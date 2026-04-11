import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Star, FileText, Settings, Award, Zap, Briefcase, Ticket, HeartPulse, ShoppingBag, Clock, CalendarDays, User, ArrowRight, Package, MessageCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const ProfilePage = () => {
  const { t, openChildProfile, openAddChildModal, openChatList, user: authUser, userData, myChildren, walletBalance, login, logout, toggleModal } = useAppContext();
  const [activeTab, setActiveTab] = useState<'bookings' | 'purchases' | 'activity'>('bookings');
  
  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 max-w-md mx-auto">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <User size={48} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Войдите в аккаунт</h2>
        <p className="text-center text-gray-500 mb-8">Чтобы сохранять данные детей, записываться к врачам и совершать покупки.</p>
        <button 
          onClick={login}
          className="w-full bg-primary text-white p-4 rounded-xl font-bold text-lg shadow-lg hover:bg-primary/90 transition-colors"
        >
          Войти через Google
        </button>
      </div>
    );
  }

  // Merge auth user with Firestore data
  const user = {
    name: authUser.displayName || userData?.name || 'Пользователь',
    avatar: authUser.photoURL || userData?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
    email: authUser.email,
    role: userData?.role || 'parent',
    region: userData?.region || { city: 'Ташкент' },
    stats: userData?.stats || { activityScore: 0 }
  };

  const level = Math.floor(user.stats.activityScore / 100);
  const progress = user.stats.activityScore % 100;

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
      {/* Profile Header & Gamification */}
      <div className="flex flex-col items-center mb-8 relative">
         <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary mb-3 relative">
            <img src={user.avatar} className="w-full h-full rounded-full border-4 border-white object-cover" alt="Avatar" />
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm text-xs">
               {level}
            </div>
         </div>
         <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
         <p className="text-sm text-gray-500 mb-4">{t(user.role as any) || user.role} • {user.region.city}</p>
         
         {/* Level Progress */}
         <div className="w-full max-w-[200px] bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
            <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
         </div>
         <p className="text-xs text-primary font-bold mb-4">{progress}/100 XP до уровня {level + 1}</p>

         {/* Badges */}
         <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600" title="Ранняя пташка"><Zap size={16}/></div>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600" title="Супер Родитель"><Award size={16}/></div>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600" title="Активист"><Star size={16}/></div>
         </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-8">
         <button onClick={openChatList} className="bg-white border border-gray-200 text-gray-800 p-3 rounded-xl font-bold text-sm flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
            <MessageCircle size={18} className="mr-2 text-primary"/> {t('myChats')}
         </button>
         <Link to="/manage-institution" className="bg-slate-900 text-white p-3 rounded-xl font-bold text-sm flex items-center justify-center shadow-lg hover:bg-slate-800 transition-colors">
            <Briefcase size={18} className="mr-2"/> Кабинет
         </Link>
      </div>
      
      {/* My Kids */}
      <div className="mb-8">
         <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800 text-lg">{t('myKids')} <span className="text-gray-400 text-sm font-medium">({myChildren.length})</span></h3>
            <button onClick={openAddChildModal} className="text-primary text-xs font-bold flex items-center bg-primary/10 px-3 py-1.5 rounded-full"><Plus size={14} className="mr-1"/> {t('add')}</button>
         </div>
         <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {myChildren.map(child => (
               <div 
                  key={child.id} 
                  onClick={() => openChildProfile(child)}
                  className="min-w-[160px] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-all cursor-pointer relative group"
               >
                  <div className="absolute top-2 right-2 text-gray-300 group-hover:text-primary transition-colors"><Settings size={14}/></div>
                  <img src={child.image} className="w-16 h-16 rounded-full mb-3 border-2 border-gray-50 object-cover" alt={child.name} />
                  <p className="font-bold text-gray-900">{child.name}</p>
                  <p className="text-xs text-gray-500 mb-2">{child.age} лет</p>
                  <div className="flex flex-wrap justify-center gap-1">
                     {child.interests?.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 text-[9px] px-2 py-0.5 rounded-full">{tag}</span>
                     ))}
                  </div>
               </div>
            ))}
            {myChildren.length === 0 && (
               <div className="text-center py-6 text-gray-400 text-sm w-full border-2 border-dashed border-gray-200 rounded-2xl">
                 У вас пока нет добавленных детей
               </div>
            )}
         </div>
      </div>

      {/* Active Subscriptions Dashboard */}
      <div className="mb-8">
         <h3 className="font-bold text-gray-800 text-lg mb-4">Мои подписки</h3>
         <div className="grid grid-cols-2 gap-3">
            {/* Kidspace Pass Widget */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                     <Ticket size={20} />
                     <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">PASS</span>
                  </div>
                  <p className="text-xs opacity-90 mb-1">Баланс визитов</p>
                  <p className="text-2xl font-extrabold mb-2">{user.kidspacePass?.balance || 0} <span className="text-xs font-normal">/ {user.kidspacePass?.totalVisits}</span></p>
                  <div className="w-full h-1.5 bg-black/20 rounded-full mb-2">
                     <div className="h-full bg-white rounded-full" style={{width: `${((user.kidspacePass?.balance || 0) / (user.kidspacePass?.totalVisits || 1)) * 100}%`}}></div>
                  </div>
                  <p className="text-[9px] opacity-80">До {user.kidspacePass?.expiryDate}</p>
               </div>
               <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            </div>

            {/* Health+ Widget */}
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                     <HeartPulse size={20} />
                     <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">HEALTH</span>
                  </div>
                  <p className="text-xs opacity-90 mb-1">Консультации</p>
                  <p className="text-2xl font-extrabold mb-2">{user.healthPass.limit - user.healthPass.used} <span className="text-xs font-normal">осталось</span></p>
                  <Link to="/health" className="text-[10px] font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg inline-flex items-center transition-colors">
                     Перейти <ArrowRight size={8} className="ml-1"/>
                  </Link>
               </div>
               <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            </div>
         </div>
      </div>

      {/* Detailed History Tabs */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
         <div className="flex border-b border-gray-100">
            <button 
               onClick={() => setActiveTab('bookings')}
               className={`flex-1 py-4 text-sm font-bold flex flex-col items-center border-b-2 transition-colors ${activeTab === 'bookings' ? 'text-primary border-primary' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
               <CalendarDays size={18} className="mb-1"/>
               Брони
            </button>
            <button 
               onClick={() => setActiveTab('purchases')}
               className={`flex-1 py-4 text-sm font-bold flex flex-col items-center border-b-2 transition-colors ${activeTab === 'purchases' ? 'text-primary border-primary' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
               <ShoppingBag size={18} className="mb-1"/>
               Покупки
            </button>
            <button 
               onClick={() => setActiveTab('activity')}
               className={`flex-1 py-4 text-sm font-bold flex flex-col items-center border-b-2 transition-colors ${activeTab === 'activity' ? 'text-primary border-primary' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
               <Clock size={18} className="mb-1"/>
               История
            </button>
         </div>

         <div className="p-4">
            {activeTab === 'bookings' && (
               <div className="space-y-4">
                  {user.bookings?.length > 0 ? user.bookings.map(b => (
                     <div key={b.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                           <p className="font-bold text-sm text-gray-800">{b.serviceName}</p>
                           <p className="text-xs text-gray-500">{b.date} • {b.time}</p>
                           <p className="text-[10px] text-primary font-bold mt-1">{b.childName}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                           {b.status === 'confirmed' ? 'Активно' : 'Архив'}
                        </span>
                     </div>
                  )) : (
                     <div className="text-center py-8 text-gray-400 text-sm">Нет бронирований</div>
                  )}
               </div>
            )}

            {activeTab === 'purchases' && (
               <div className="space-y-4">
                  {user.orders.length > 0 ? user.orders.map(order => (
                     <div key={order.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <p className="text-xs font-bold text-gray-500 uppercase">Заказ #{order.id.slice(-4)}</p>
                              <p className="text-[10px] text-gray-400">{order.date}</p>
                           </div>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {order.status === 'delivered' ? 'Доставлен' : 'В пути'}
                           </span>
                        </div>
                        <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                           {order.items.map(item => (
                              <img key={item.id} src={item.productImage} className="w-10 h-10 rounded-lg object-cover border border-white" alt="Product"/>
                           ))}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
                           <div className="flex items-center text-xs text-gray-600">
                              <Package size={12} className="mr-1"/> {order.items.length} товара
                           </div>
                           <span className="font-bold text-sm text-gray-900">{order.total.toLocaleString()} UZS</span>
                        </div>
                     </div>
                  )) : (
                     <div className="text-center py-8 text-gray-400 text-sm">Нет заказов</div>
                  )}
               </div>
            )}

            {activeTab === 'activity' && (
               <div className="space-y-4 relative pl-4 border-l-2 border-gray-100 ml-2">
                  {user.history.map(h => (
                     <div key={h.id} className="relative pl-4 pb-2">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 bg-gray-200 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium text-gray-800">{h.description}</p>
                        <p className="text-[10px] text-gray-400">{h.date}</p>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>

      <button onClick={logout} className="w-full bg-red-50 text-red-500 p-4 rounded-xl font-bold text-sm mt-6">
         {t('logout')}
      </button>
    </div>
  );
};