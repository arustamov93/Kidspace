import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Wallet, Bell, QrCode, Plus, Calendar, MessageCircleQuestion, Sun, Map, ShoppingBag, Baby, School, BookOpen, Trophy } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Ticket, Sparkles, ArrowRight } from 'lucide-react';

const KidspacePassBanner = () => {
  const { t } = useAppContext();
  return (
    <div className="relative w-full h-48 sm:h-56 rounded-3xl overflow-hidden mb-6 group">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500"></div>
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
      
      <div className="absolute top-6 left-6 text-white/30 animate-float"><Ticket size={32} /></div>
      <div className="absolute bottom-10 right-10 text-white/20 animate-bounce-slow"><Sparkles size={40} /></div>
      
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-8 max-w-lg">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2 drop-shadow-sm">
          {t('bannerTitle')}
        </h2>
        <p className="text-orange-50 text-xs sm:text-sm font-medium mb-4 pr-12 line-clamp-2">
          {t('bannerSub')}
        </p>
        <Link to="/pass">
          <button className="bg-white text-orange-600 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-orange-50 transition-transform active:scale-95 flex items-center w-fit group-hover:gap-2">
             {t('joinPass')} <ArrowRight size={16} className="ml-1 transition-all" />
          </button>
        </Link>
      </div>
    </div>
  );
};

const LanguageSelector = () => {
  const { language, setLanguage } = useAppContext();
  return (
    <button 
      onClick={() => setLanguage(language === 'ru' ? 'uz' : 'ru')}
      className="bg-white px-2 py-1 rounded-full text-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
      title={language === 'ru' ? "Switch to Uzbek" : "На русском"}
    >
      {language === 'ru' ? '🇷🇺' : '🇺🇿'}
    </button>
  );
};

export const HomePage = () => {
  const [search, setSearch] = useState('');
  const { t, toggleModal, openChatWith, walletBalance, products } = useAppContext();

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">KidSpace <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded ml-1">5.0</span></h1>
          <p className="text-xs text-gray-500 flex items-center mt-1"><MapPin size={10} className="mr-1"/> Tashkent, Uzbekistan</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => toggleModal('wallet')} className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 hover:bg-gray-200 transition-colors">
              <Wallet size={16} className="text-primary mr-2" />
              <span className="text-xs font-bold text-gray-700">{walletBalance?.toLocaleString()}</span>
           </button>
           <div className="relative">
              <button onClick={() => toggleModal('notifications')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 relative"><Bell size={20} className="text-gray-600"/></button>
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
           </div>
           <LanguageSelector />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder={t('searchPlaceholder')}
          className="w-full bg-white border-none shadow-sm rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
      </div>

      <KidspacePassBanner />

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 mb-8">
         <button onClick={() => toggleModal('scan')} className="flex flex-col items-center group">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-active:scale-95 transition-transform">
               <QrCode size={22} />
            </div>
            <span className="text-[10px] font-bold text-gray-600">{t('scan')}</span>
         </button>
         <button onClick={() => toggleModal('wallet')} className="flex flex-col items-center group">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2 group-active:scale-95 transition-transform">
               <Plus size={22} />
            </div>
            <span className="text-[10px] font-bold text-gray-600">{t('topUp')}</span>
         </button>
         <button onClick={() => toggleModal('bookings')} className="flex flex-col items-center group">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-active:scale-95 transition-transform">
               <Calendar size={22} />
            </div>
            <span className="text-[10px] font-bold text-gray-600">{t('book')}</span>
         </button>
         <button onClick={() => openChatWith('support', null)} className="flex flex-col items-center group">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2 group-active:scale-95 transition-transform">
               <MessageCircleQuestion size={22} />
            </div>
            <span className="text-[10px] font-bold text-gray-600">{t('support')}</span>
         </button>
      </div>

      {/* Categories */}
      <div className="mb-6">
         <div className="flex justify-between items-end mb-4">
           <h2 className="text-lg font-bold text-gray-800">Категории</h2>
           <button className="text-xs text-primary font-bold">{t('all')}</button>
         </div>
         <div className="grid grid-cols-2 gap-3">
            <Link to="/catalog/Kindergarten" className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow h-32 group">
               <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Baby size={28} />
               </div>
               <span className="font-bold text-gray-800 text-sm">Садики</span>
            </Link>
            <Link to="/catalog/School" className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow h-32 group">
               <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <School size={28} />
               </div>
               <span className="font-bold text-gray-800 text-sm">Школы</span>
            </Link>
            <Link to="/catalog/Course" className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow h-32 group">
               <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen size={28} />
               </div>
               <span className="font-bold text-gray-800 text-sm">Курсы</span>
            </Link>
            <Link to="/catalog/Section" className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow h-32 group">
               <div className="w-12 h-12 rounded-full bg-green-100 text-green-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Trophy size={28} />
               </div>
               <span className="font-bold text-gray-800 text-sm">Секции</span>
            </Link>
         </div>
      </div>

      {/* Daily Tip */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3 mb-6">
        <div className="bg-amber-100 p-2 rounded-full shrink-0">
          <Sun className="text-amber-500" size={20} />
        </div>
        <div>
           <h4 className="font-bold text-amber-800 text-sm mb-1">{t('dailyTip')}</h4>
           <p className="text-xs text-amber-700 leading-relaxed">"Чтение 20 минут в день помогает ребенку узнать 1.8 млн новых слов в год!"</p>
        </div>
      </div>

      {/* Near You Map Widget */}
      <div className="bg-gray-800 rounded-3xl h-40 w-full mb-8 relative overflow-hidden group">
         <img src="https://picsum.photos/id/10/600/300" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Map" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
         <div className="absolute bottom-4 left-4">
            <h3 className="text-white font-bold text-lg">{t('nearYou')}</h3>
            <p className="text-gray-300 text-xs">3 школы и 2 парка в 500м</p>
         </div>
         <button className="absolute bottom-4 right-4 bg-white text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-lg hover:bg-gray-100">
           <Map size={14} className="mr-1"/> {t('openMap')}
         </button>
      </div>

      {/* Kids Market Teaser */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-lg font-bold text-gray-800 flex items-center"><ShoppingBag size={20} className="mr-2 text-secondary" /> {t('kidsMarket')}</h2>
           <Link to="/market" className="text-secondary text-xs font-bold">{t('toShop')}</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
           {products.slice(0, 5).map(product => (
              <div key={product.id} className="min-w-[140px] bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                 <img src={product.images[0]} className="w-full h-24 object-cover rounded-lg mb-2" alt={product.name} />
                 <h4 className="font-bold text-xs text-gray-800 truncate mb-1">{product.name}</h4>
                 <p className="text-secondary font-extrabold text-xs">{product.price.toLocaleString()} UZS</p>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};