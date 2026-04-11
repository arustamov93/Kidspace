import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Star, MapPin, MapPinned, ShieldAlert, BadgeCheck, SlidersHorizontal, Eye, MousePointerClick, Save, ArrowLeft, MessageSquare, Image as ImageIcon, Calendar } from 'lucide-react';
import { MOCK_REVIEWS } from '../constants';
import { useAppContext } from '../context/AppContext';
import { Institution } from '../types';

export const CatalogPage = () => {
  const { type } = useParams<{type: string}>();
  const { t, institutions } = useAppContext();
  
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [onlyVerified, setOnlyVerified] = useState(false);
  
  // Base Items
  const items = type === 'School' 
    ? institutions.filter(i => i.type === 'School') 
    : institutions.filter(i => i.type !== 'School'); // Generic catch-all for MVP

  // Filtering Logic
  const filteredItems = items.filter(item => {
    if (onlyVerified && !item.isVerified) return false;
    if (item.rating < minRating) return false;
    return true;
  });

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center">
            <Link to="/"><ChevronLeft className="mr-2 text-gray-600"/></Link>
            <h1 className="text-xl font-bold">{type === 'School' ? 'Школы' : 'Каталог'}</h1>
         </div>
         <button 
           onClick={() => setShowFilters(!showFilters)}
           className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
         >
            <SlidersHorizontal size={20} />
         </button>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-slide-up">
           <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-700">Фильтры</span>
              <button onClick={() => {setMinRating(0); setOnlyVerified(false);}} className="text-xs text-primary font-bold">Сбросить</button>
           </div>
           
           <div className="space-y-4">
              {/* Verified Toggle */}
              <div className="flex items-center justify-between">
                 <div className="flex items-center text-sm text-gray-600">
                    <BadgeCheck size={16} className="text-blue-500 mr-2" />
                    Только проверенные
                 </div>
                 <div 
                   onClick={() => setOnlyVerified(!onlyVerified)}
                   className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${onlyVerified ? 'bg-primary' : 'bg-gray-200'}`}
                 >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${onlyVerified ? 'translate-x-4' : ''}`}></div>
                 </div>
              </div>

              {/* Rating */}
              <div>
                 <p className="text-xs text-gray-500 mb-2">Рейтинг от {minRating}</p>
                 <div className="flex gap-2">
                    {[3, 4, 4.5, 4.8].map(r => (
                       <button 
                         key={r}
                         onClick={() => setMinRating(r)}
                         className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${minRating === r ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-gray-100 text-gray-500'}`}
                       >
                          {r}+ <Star size={10} className="inline -mt-0.5" />
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredItems.length > 0 ? filteredItems.map(item => (
          <Link key={item.id} to={`/institution/${item.id}`} className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
             {item.isVerified && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl z-10 flex items-center shadow-sm">
                   <BadgeCheck size={12} className="mr-1"/> Verified
                </div>
             )}
             <div className="flex gap-4">
                <img src={item.images[0]} className="w-20 h-20 rounded-xl object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
                <div className="flex-1">
                   <h3 className="font-bold text-gray-900 text-sm mb-1 pr-16 leading-tight">{item.name}</h3>
                   <p className="text-xs text-gray-500 mb-2 line-clamp-1">{item.address}</p>
                   <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center">
                            <Star size={10} className="mr-1 fill-amber-700"/> {item.rating}
                          </span>
                          <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{item.type}</span>
                      </div>
                      <span className="text-xs font-bold text-primary">{item.price > 0 ? `${(item.price / 1000).toFixed(0)}k` : 'Бесплатно'}</span>
                   </div>
                </div>
             </div>
          </Link>
        )) : (
          <div className="text-center py-10 text-gray-400 text-sm">Ничего не найдено</div>
        )}
      </div>
    </div>
  );
};

export const InstitutionPage = () => {
  const { id } = useParams<{id: string}>();
  const { openReviewModal, startBooking, openChatWith, institutions } = useAppContext();
  const item = institutions.find(i => i.id === id);
  
  if(!item) return <div className="p-8 text-center">Not Found</div>;

  const reviews = MOCK_REVIEWS.filter(r => r.institutionID === item.id && r.status === 'published');

  return (
    <div className="pb-24 bg-white min-h-screen">
       {/* Header Image */}
       <div className="relative h-64">
          <img src={item.images[0]} className="w-full h-full object-cover" alt={item.name} />
          <Link to="/" className="absolute top-4 left-4 bg-white/50 p-2 rounded-full backdrop-blur-sm hover:bg-white/80 transition-colors"><ChevronLeft size={24} className="text-gray-800"/></Link>
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
       </div>
       
       <div className="-mt-6 bg-white rounded-t-[32px] px-6 pt-8 relative z-10">
          <div className="flex justify-between items-start mb-2">
             <div className="flex-1">
                 <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-1">{item.name}</h1>
                 {item.isVerified && <span className="text-[10px] font-bold text-blue-500 flex items-center bg-blue-50 w-fit px-2 py-0.5 rounded-full"><BadgeCheck size={12} className="mr-1"/> Официальный партнер</span>}
             </div>
          </div>
          <p className="text-sm text-gray-500 mb-6 flex items-start">
             <MapPin size={16} className="mr-1.5 mt-0.5 shrink-0 text-gray-400"/> 
             {item.address}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-400 mb-1 font-medium">Рейтинг</p>
                <p className="text-lg font-extrabold text-gray-800 flex items-center">
                   <Star size={20} className="text-amber-400 fill-amber-400 mr-2"/> 
                   {item.rating}
                </p>
             </div>
             <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-400 mb-1 font-medium">Цена</p>
                <p className="text-lg font-extrabold text-primary truncate">
                   {item.price.toLocaleString()} <span className="text-xs font-bold text-primary/70">UZS</span>
                </p>
             </div>
          </div>

          <div className="mb-8">
             <h3 className="font-bold text-gray-900 mb-3 text-lg">Описание</h3>
             <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
          </div>

          {/* Fixed Map Section */}
          <div className="mb-8 rounded-2xl overflow-hidden relative h-48 bg-gray-100 group shadow-sm border border-gray-100">
             <iframe 
               title="map"
               width="100%" 
               height="100%" 
               frameBorder="0" 
               scrolling="no" 
               marginHeight={0} 
               marginWidth={0} 
               src={`https://maps.google.com/maps?q=${item.location.lat},${item.location.lng}&z=15&output=embed`}
               className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
             ></iframe>
             
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${item.location.lat},${item.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/90 backdrop-blur-sm text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg flex items-center hover:scale-105 transition-transform hover:bg-white pointer-events-auto"
                >
                  <MapPinned size={18} className="mr-2 text-primary" /> Открыть на карте
                </a>
             </div>
          </div>

          {/* Available Services */}
          {item.services && item.services.length > 0 && (
             <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Услуги и Классы</h3>
                <div className="space-y-3">
                   {item.services.map(srv => (
                      <div key={srv.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                         <div>
                            <p className="font-bold text-gray-800 text-sm">{srv.name}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                               {srv.duration > 0 && <span className="flex items-center mr-3"><Calendar size={12} className="mr-1"/> {srv.duration} мин</span>}
                               <span className="text-primary font-bold">{srv.price === 0 ? 'Бесплатно' : `${srv.price.toLocaleString()} UZS`}</span>
                            </div>
                         </div>
                         <button 
                           onClick={() => startBooking(item, srv)}
                           className="bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors shadow-sm"
                         >
                            Записаться
                         </button>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* Reviews Section */}
          <div className="mb-8">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg flex items-center">
                   Отзывы <span className="ml-2 text-gray-400 text-sm font-medium">{reviews.length}</span>
                </h3>
                <button 
                  onClick={() => openReviewModal(item.id)}
                  className="text-xs font-bold text-primary flex items-center bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                >
                   <MessageSquare size={14} className="mr-1"/> Написать отзыв
                </button>
             </div>

             <div className="space-y-4">
                {reviews.length > 0 ? reviews.map(review => (
                   <div key={review.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center">
                            <img src={review.userAvatar || `https://ui-avatars.com/api/?name=${review.userName}`} className="w-8 h-8 rounded-full mr-3 border border-white" alt={review.userName} />
                            <div>
                               <p className="text-xs font-bold text-gray-900">{review.userName}</p>
                               <div className="flex">
                                  {[1, 2, 3, 4, 5].map(star => (
                                     <Star key={star} size={10} className={`${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                  ))}
                               </div>
                            </div>
                         </div>
                         <span className="text-[10px] text-gray-400">{review.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{review.text}</p>
                      
                      {/* Attached Photos */}
                      {review.images && review.images.length > 0 && (
                         <div className="flex gap-2 overflow-x-auto pb-2">
                            {review.images.map((img, idx) => (
                               <img key={idx} src={img} className="w-16 h-16 rounded-lg object-cover border border-white cursor-pointer hover:opacity-90" alt="Review attachment" />
                            ))}
                         </div>
                      )}
                   </div>
                )) : (
                   <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      Нет отзывов. Станьте первым!
                   </div>
                )}
             </div>
          </div>

          <div className="flex gap-3 pb-6">
             <button 
               onClick={() => openChatWith('institution', item)}
               className="px-5 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors flex flex-col items-center justify-center"
             >
                <MessageSquare size={20} />
             </button>
             <button onClick={() => startBooking(item)} className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-opacity active:scale-[0.98]">
                Забронировать
             </button>
          </div>
       </div>
    </div>
  );
};

export const ManageInstitutionPage = () => {
   const { institutions } = useAppContext();
   // Use inst_2 as the demo institution for the partner view
   const [institution, setInstitution] = useState<Institution | undefined>(institutions.find(i => i.id === 'inst_2'));

   React.useEffect(() => {
     if (!institution && institutions.length > 0) {
       setInstitution(institutions.find(i => i.id === 'inst_2'));
     }
   }, [institutions, institution]);

   if (!institution) return <div className="p-8 text-center text-gray-500">Загрузка...</div>;

   const handleSave = () => {
      alert("Изменения сохранены и отправлены на модерацию!");
   }

   return (
      <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
         <div className="flex items-center mb-6">
            <Link to="/profile"><ArrowLeft className="mr-2 text-gray-600"/></Link>
            <h1 className="text-xl font-bold text-slate-900">Кабинет Партнера</h1>
         </div>

         {/* Stats Dashboard */}
         <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-10"><Eye size={64}/></div>
               <p className="text-xs text-gray-500 font-bold mb-1">Просмотры</p>
               <p className="text-2xl font-extrabold text-blue-600">1,245</p>
               <p className="text-[10px] text-green-500 font-bold mt-1">+12% за неделю</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-10"><MousePointerClick size={64}/></div>
               <p className="text-xs text-gray-500 font-bold mb-1">Заявки</p>
               <p className="text-2xl font-extrabold text-green-600">48</p>
               <p className="text-[10px] text-green-500 font-bold mt-1">3 новые сегодня</p>
            </div>
         </div>

         {/* Edit Form */}
         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-50">
               <h3 className="font-bold text-gray-800">Редактирование</h3>
               <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${institution.isVerified ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-500'}`}>
                  {institution.isVerified ? 'Verified Partner' : 'Unverified'}
               </span>
            </div>
            
            <div>
               <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Название</label>
               <input 
                  value={institution.name} 
                  onChange={e => setInstitution({...institution, name: e.target.value})}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
               />
            </div>

            <div>
               <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Адрес</label>
               <input 
                  value={institution.address} 
                  onChange={e => setInstitution({...institution, address: e.target.value})}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
               />
            </div>

            <div>
               <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Цена (UZS)</label>
               <input 
                  type="number"
                  value={institution.price} 
                  onChange={e => setInstitution({...institution, price: parseInt(e.target.value)})}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
               />
            </div>

             <div>
               <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Описание</label>
               <textarea 
                  value={institution.description} 
                  onChange={e => setInstitution({...institution, description: e.target.value})}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all h-32 resize-none outline-none"
               />
            </div>

            <button 
               onClick={handleSave}
               className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg mt-4"
            >
               <Save size={18} className="mr-2"/> Сохранить Изменения
            </button>
         </div>
      </div>
   )
}