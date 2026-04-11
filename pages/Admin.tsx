import React, { useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, AlertCircle, TrendingUp, ArrowUpRight, ArrowLeft, MessageSquare, Check, X, Building2, Stethoscope, Ticket, Edit, Trash2, Search, Plus, MapPin, Star, MoreVertical, BadgeCheck } from 'lucide-react';
import { ADMIN_STATS, MOCK_TRANSACTIONS, MOCK_COMPLAINTS, MOCK_REVIEWS, MOCK_INSTITUTIONS, MOCK_DOCTORS, PASS_PACKAGES, MOCK_USERS } from '../constants';
import { Review, Institution, Doctor, PassPackage } from '../types';

// --- Components ---

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white';

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen p-4 fixed left-0 top-0 z-50">
       <div className="mb-8 px-2 flex items-center">
          <div className="w-8 h-8 bg-primary rounded-lg mr-3 flex items-center justify-center font-bold text-white text-xl">K</div>
          <div>
             <h1 className="text-xl font-bold text-white">KidSpace</h1>
             <span className="text-xs text-slate-500 font-medium">Admin Panel</span>
          </div>
       </div>
       <nav className="space-y-1">
          <Link to="/admin" className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive('/admin')}`}><LayoutDashboard size={18} className="mr-3"/> Обзор</Link>
          <p className="px-4 pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Управление</p>
          <Link to="/admin/institutions" className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/admin/institutions')}`}><Building2 size={18} className="mr-3"/> Учреждения</Link>
          <Link to="/admin/doctors" className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/admin/doctors')}`}><Stethoscope size={18} className="mr-3"/> Врачи</Link>
          <Link to="/admin/subscriptions" className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/admin/subscriptions')}`}><Ticket size={18} className="mr-3"/> Подписки</Link>
          <p className="px-4 pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Модерация</p>
          <Link to="/admin/reviews" className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/admin/reviews')}`}><MessageSquare size={18} className="mr-3"/> Отзывы</Link>
          <Link to="/admin/complaints" className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/admin/complaints')}`}><AlertCircle size={18} className="mr-3"/> Жалобы</Link>
          <Link to="/admin/finance" className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/admin/finance')}`}><CreditCard size={18} className="mr-3"/> Финансы</Link>
       </nav>
       <div className="mt-auto">
          <Link to="/" className="flex items-center px-4 py-3 text-sm text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-xl"><ArrowLeft size={16} className="mr-2"/> Вернуться в App</Link>
       </div>
    </div>
  );
};

const DashboardHome = () => {
  return (
    <div className="space-y-6 animate-fade-in">
       <h2 className="text-2xl font-bold text-slate-800">Обзор системы</h2>
       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center">+12% <ArrowUpRight size={12} className="ml-1"/></span>
             </div>
             <h3 className="text-3xl font-extrabold text-slate-800 relative z-10">{ADMIN_STATS.totalUsers.toLocaleString()}</h3>
             <p className="text-sm text-slate-500 relative z-10">Активных пользователей</p>
             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 rounded-full opacity-50"></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CreditCard size={24} /></div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center">+5% <ArrowUpRight size={12} className="ml-1"/></span>
             </div>
             <h3 className="text-3xl font-extrabold text-slate-800 relative z-10">{(ADMIN_STATS.totalRevenue / 1000000).toFixed(1)}M <span className="text-lg text-slate-400">UZS</span></h3>
             <p className="text-sm text-slate-500 relative z-10">Выручка за месяц</p>
             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50"></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Building2 size={24} /></div>
                <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">Всего</span>
             </div>
             <h3 className="text-3xl font-extrabold text-slate-800 relative z-10">{ADMIN_STATS.activeInstitutions}</h3>
             <p className="text-sm text-slate-500 relative z-10">Учреждений в каталоге</p>
             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-50 rounded-full opacity-50"></div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-slate-800">Динамика Выручки</h4>
                <select className="text-xs border-none bg-slate-50 rounded-lg px-2 py-1 font-bold text-slate-600 outline-none">
                   <option>За неделю</option>
                   <option>За месяц</option>
                </select>
             </div>
             <div className="h-48 flex items-end justify-between gap-3 px-2">
                {ADMIN_STATS.revenueData.map((val, idx) => (
                   <div key={idx} className="w-full flex flex-col items-center group relative">
                      <div className="absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                         {(val/1000000).toFixed(1)}M UZS
                      </div>
                      <div className="w-full bg-indigo-100 rounded-t-lg relative overflow-hidden transition-all group-hover:bg-indigo-200" style={{ height: `${(val / 60000000) * 100}%` }}>
                         <div className="absolute bottom-0 w-full bg-primary h-0 transition-all duration-1000 group-hover:h-full opacity-80"></div>
                      </div>
                   </div>
                ))}
             </div>
             <div className="flex justify-between text-xs text-slate-400 mt-3 font-medium uppercase tracking-wider">
                <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
             </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-800">Последние операции</h4>
                <button className="text-primary text-xs font-bold hover:underline">Все операции</button>
             </div>
             <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {MOCK_TRANSACTIONS.map(tx => (
                   <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="flex items-center">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-3 ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {tx.amount > 0 ? '+' : '-'}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-700">{tx.type}</p>
                            <p className="text-[10px] text-slate-400">{tx.userName} • {tx.date}</p>
                         </div>
                      </div>
                      <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-slate-800'}`}>
                         {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                      </span>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

const InstitutionsManager = () => {
   const [items, setItems] = useState(MOCK_INSTITUTIONS);
   const [search, setSearch] = useState('');

   const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

   const toggleVerify = (id: string) => {
      setItems(items.map(i => i.id === id ? { ...i, isVerified: !i.isVerified } : i));
   };

   const deleteItem = (id: string) => {
      if(window.confirm('Вы уверены?')) {
         setItems(items.filter(i => i.id !== id));
      }
   };

   return (
      <div className="space-y-6 animate-fade-in">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Управление учреждениями</h2>
            <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-lg shadow-primary/30 hover:bg-indigo-600 transition-colors">
               <Plus size={18} className="mr-2"/> Добавить
            </button>
         </div>

         {/* Search */}
         <div className="relative">
            <input 
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="Поиск по названию..."
               className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <Search size={18} className="absolute left-3 top-3 text-slate-400"/>
         </div>

         {/* List */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                     <th className="p-4">Название</th>
                     <th className="p-4">Тип</th>
                     <th className="p-4">Рейтинг</th>
                     <th className="p-4 text-center">Статус</th>
                     <th className="p-4 text-right">Действия</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredItems.map(item => (
                     <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                           <div className="flex items-center">
                              <img src={item.images[0]} className="w-10 h-10 rounded-lg object-cover mr-3 bg-gray-100" alt={item.name}/>
                              <div>
                                 <p className="font-bold text-sm text-slate-800">{item.name}</p>
                                 <p className="text-[10px] text-slate-400">{item.address}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-4">
                           <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">{item.type}</span>
                        </td>
                        <td className="p-4">
                           <div className="flex items-center text-amber-500 text-sm font-bold">
                              <Star size={14} className="fill-amber-500 mr-1"/> {item.rating}
                           </div>
                        </td>
                        <td className="p-4 text-center">
                           <button 
                              onClick={() => toggleVerify(item.id)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-colors ${item.isVerified ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                           >
                              {item.isVerified ? 'Verified' : 'Unverified'}
                           </button>
                        </td>
                        <td className="p-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500"><Edit size={16}/></button>
                              <button onClick={() => deleteItem(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16}/></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {filteredItems.length === 0 && <div className="p-8 text-center text-slate-400">Ничего не найдено</div>}
         </div>
      </div>
   );
};

const DoctorsManager = () => {
   const [doctors, setDoctors] = useState(MOCK_DOCTORS);

   const toggleStatus = (id: string) => {
      setDoctors(doctors.map(d => d.id === id ? { ...d, isOnline: !d.isOnline } : d));
   };

   return (
      <div className="space-y-6 animate-fade-in">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Врачи</h2>
            <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-lg hover:bg-indigo-600">
               <Plus size={18} className="mr-2"/> Добавить Врача
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doc => (
               <div key={doc.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative group">
                  <div className="flex items-start mb-4">
                     <div className="relative mr-4">
                        <img src={doc.image} className="w-16 h-16 rounded-full object-cover border-2 border-gray-50" alt={doc.name}/>
                        <span className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${doc.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-800 text-lg">{doc.name}</h4>
                        <p className="text-sm text-primary font-medium">{doc.specialty}</p>
                        <p className="text-xs text-slate-400 mt-1">Опыт: {doc.experience} лет</p>
                     </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                     <div className="flex items-center text-amber-500 font-bold text-sm">
                        <Star size={16} className="fill-amber-500 mr-1"/> {doc.rating}
                     </div>
                     <p className="font-bold text-slate-800">{doc.price.toLocaleString()} UZS</p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => toggleStatus(doc.id)} className={`py-2 rounded-lg text-xs font-bold ${doc.isOnline ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {doc.isOnline ? 'Отключить' : 'Включить'}
                     </button>
                     <button className="py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200">
                        Изменить
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

const ReviewsModeration = () => {
   const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS.filter(r => r.status === 'moderation'));

   const handleAction = (id: string, action: 'published' | 'rejected') => {
      setReviews(reviews.filter(r => r.id !== id));
      alert(`Отзыв ${action === 'published' ? 'опубликован' : 'отклонен'}`);
   };

   return (
      <div className="space-y-6 animate-fade-in">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Модерация Отзывов</h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">{reviews.length} ожидают</span>
         </div>
         
         {reviews.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
               {reviews.map(review => {
                  const institutionName = MOCK_INSTITUTIONS.find(i => i.id === review.institutionID)?.name || 'Unknown';
                  return (
                     <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <p className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center"><Building2 size={12} className="mr-1"/> {institutionName}</p>
                              <div className="flex items-center">
                                 <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold mr-2 text-gray-600">{review.userName.charAt(0)}</div>
                                 <p className="font-bold text-slate-800 mr-2">{review.userName}</p>
                                 <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                       <Star key={i} size={12} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                                    ))}
                                 </div>
                              </div>
                           </div>
                           <span className="text-xs text-slate-400">{review.date}</span>
                        </div>
                        <p className="text-slate-600 mb-4 bg-slate-50 p-4 rounded-xl text-sm italic">"{review.text}"</p>
                        
                        <div className="flex gap-3 justify-end">
                           <button 
                              onClick={() => handleAction(review.id, 'rejected')}
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 flex items-center transition-colors"
                           >
                              <X size={16} className="mr-2"/> Отклонить
                           </button>
                           <button 
                              onClick={() => handleAction(review.id, 'published')}
                              className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-bold hover:bg-green-100 flex items-center transition-colors"
                           >
                              <Check size={16} className="mr-2"/> Опубликовать
                           </button>
                        </div>
                     </div>
                  );
               })}
            </div>
         ) : (
            <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 flex flex-col items-center">
               <Check size={48} className="text-green-200 mb-4"/>
               <p className="font-bold">Все чисто!</p>
               <p className="text-sm">Нет отзывов на модерации</p>
            </div>
         )}
      </div>
   );
};

const SubscriptionManager = () => {
   return (
      <div className="space-y-6 animate-fade-in">
         <h2 className="text-2xl font-bold text-slate-800">Пакеты подписок (Pass)</h2>
         
         {/* Packages */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {PASS_PACKAGES.map(pkg => (
               <div key={pkg.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${pkg.color}`}></div>
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h4 className="font-bold text-xl text-slate-800">{pkg.name}</h4>
                        <p className="text-sm text-slate-500">{pkg.visits} визитов</p>
                     </div>
                     {pkg.popular && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full">Popular</span>}
                  </div>
                  <p className="text-2xl font-extrabold text-primary mb-4">{pkg.price.toLocaleString()} <span className="text-sm text-slate-400 font-medium">UZS</span></p>
                  <p className="text-xs text-slate-500 mb-6">{pkg.description}</p>
                  <button className="w-full py-2 rounded-xl bg-slate-50 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors">Редактировать</button>
               </div>
            ))}
            <button className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 hover:border-slate-300 transition-all min-h-[200px]">
               <Plus size={32} className="mb-2 opacity-50"/>
               <span className="font-bold text-sm">Создать пакет</span>
            </button>
         </div>

         <h3 className="text-lg font-bold text-slate-800 mb-4">Активные подписки</h3>
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                     <th className="p-4">Пользователь</th>
                     <th className="p-4">План</th>
                     <th className="p-4">Статус</th>
                     <th className="p-4">Истекает</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {MOCK_USERS.filter(u => u.kidspacePass).map(u => (
                     <tr key={u.id}>
                        <td className="p-4 flex items-center">
                           <img src={u.avatar} className="w-8 h-8 rounded-full mr-3" alt={u.name}/>
                           <span className="font-bold text-sm text-slate-700">{u.name}</span>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{u.kidspacePass?.planName}</td>
                        <td className="p-4">
                           <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${u.kidspacePass?.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                              {u.kidspacePass?.status.toUpperCase()}
                           </span>
                        </td>
                        <td className="p-4 text-sm text-slate-500">{u.kidspacePass?.expiryDate}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
};

const FinanceView = () => (
   <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800">Финансы</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
         <h4 className="font-bold text-slate-800 mb-4">Транзакции за сегодня</h4>
         <div className="space-y-2">
            {MOCK_TRANSACTIONS.map(tx => (
               <div key={tx.id} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center">
                     <div className={`p-2 rounded-full mr-3 ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {tx.amount > 0 ? <ArrowUpRight size={16}/> : <TrendingUp size={16} className="rotate-180"/>}
                     </div>
                     <div>
                        <p className="font-bold text-sm text-slate-700">{tx.type}</p>
                        <p className="text-[10px] text-slate-400">{tx.date} • {tx.userName}</p>
                     </div>
                  </div>
                  <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-slate-800'}`}>
                     {tx.amount.toLocaleString()} UZS
                  </span>
               </div>
            ))}
         </div>
      </div>
   </div>
);

const ComplaintsView = () => (
   <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800">Жалобы</h2>
      <div className="grid gap-4">
         {MOCK_COMPLAINTS.map(c => (
            <div key={c.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
               <div>
                  <div className="flex items-center mb-1">
                     <span className={`w-2 h-2 rounded-full mr-2 ${c.priority === 'High' ? 'bg-red-500' : c.priority === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                     <h4 className="font-bold text-slate-800">{c.institutionName}</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{c.text}</p>
                  <p className="text-[10px] text-slate-400">ID: {c.userID} • {c.date}</p>
               </div>
               <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg mb-2 ${c.status === 'New' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                     {c.status}
                  </span>
                  <button className="text-xs font-bold text-slate-500 hover:text-primary underline">Детали</button>
               </div>
            </div>
         ))}
      </div>
   </div>
);

export const AdminPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 md:pl-64">
       <Sidebar />
       <div className="p-4 md:p-8 pb-24">
          <Routes>
             <Route path="/" element={<DashboardHome />} />
             <Route path="/institutions" element={<InstitutionsManager />} />
             <Route path="/doctors" element={<DoctorsManager />} />
             <Route path="/reviews" element={<ReviewsModeration />} />
             <Route path="/subscriptions" element={<SubscriptionManager />} />
             <Route path="/finance" element={<FinanceView />} />
             <Route path="/complaints" element={<ComplaintsView />} />
             <Route path="*" element={<div className="p-10 text-center text-slate-400 font-bold">Страница не найдена</div>} />
          </Routes>
       </div>
    </div>
  );
};