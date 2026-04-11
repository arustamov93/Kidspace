import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Ticket, HeartPulse, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const BottomNav = () => {
  const location = useLocation();
  const { t } = useAppContext();
  
  const isActive = (path: string) => location.pathname === path ? 'text-primary' : 'text-gray-400';
  
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-2 flex justify-between items-center z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] safe-area-bottom">
      <Link to="/" className={`flex flex-col items-center w-1/5 ${isActive('/')}`}>
        <Home size={22} />
        <span className="text-[10px] mt-1">{t('home')}</span>
      </Link>
      <Link to="/catalog/School" className={`flex flex-col items-center w-1/5 ${isActive('/catalog/School')}`}>
        <Search size={22} />
        <span className="text-[10px] mt-1">{t('education')}</span>
      </Link>
      <Link to="/pass" className={`flex flex-col items-center w-1/5 ${isActive('/pass')}`}>
        <div className={`p-2 rounded-full -mt-6 shadow-lg border-4 border-gray-50 ${location.pathname === '/pass' ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
           <Ticket size={24} />
        </div>
        <span className="text-[10px] mt-1 font-bold text-secondary">{t('pass')}</span>
      </Link>
      <Link to="/health" className={`flex flex-col items-center w-1/5 ${isActive('/health')}`}>
        <HeartPulse size={22} />
        <span className="text-[10px] mt-1">{t('health')}</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center w-1/5 ${isActive('/profile')}`}>
        <User size={22} />
        <span className="text-[10px] mt-1">{t('profile')}</span>
      </Link>
    </div>
  );
};