import React, { useState } from 'react';
import { ShoppingBag, Search, Filter, ShoppingCart, Plus, Tag, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const MarketPage = () => {
  const [category, setCategory] = useState('All');
  const { toggleModal, openProductDetails, cartItems, products } = useAppContext();

  const filteredProducts = category === 'All' 
    ? products 
    : products.filter(p => p.category === category);

  const categories = ['All', 'Игрушки', 'Школьные товары', 'Одежда', 'Книги', 'Спорт'];

  // Calculate total items count
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-secondary flex items-center">
          <ShoppingBag className="mr-2" /> Market
        </h1>
        <button onClick={() => toggleModal('cart')} className="p-2 bg-white rounded-full shadow-sm relative hover:bg-gray-50 transition-colors">
           <ShoppingCart size={20} className="text-gray-700"/>
           {cartCount > 0 && (
             <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border border-white font-bold">{cartCount}</span>
           )}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
         <input 
           type="text" 
           placeholder="Поиск игрушек, книг..." 
           className="w-full bg-white rounded-xl py-3 pl-10 pr-4 text-sm shadow-sm border border-gray-100 focus:ring-2 focus:ring-secondary/20 outline-none"
         />
         <Search size={18} className="absolute left-3 top-3 text-gray-400" />
      </div>

      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 text-white mb-8 relative overflow-hidden">
         <div className="relative z-10">
            <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md mb-2 inline-block">SALE</span>
            <h3 className="font-bold text-lg leading-tight mb-1">Скидки до 50%</h3>
            <p className="text-xs text-indigo-100 mb-3">На школьную форму и рюкзаки</p>
            <button className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:bg-gray-100 transition-colors">Смотреть</button>
         </div>
         <Tag className="absolute bottom-[-10px] right-[-10px] w-24 h-24 text-white/10 rotate-12" />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
         {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${category === cat ? 'bg-secondary text-white' : 'bg-white text-gray-600 border border-gray-100'}`}
            >
               {cat}
            </button>
         ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-4">
         {filteredProducts.map(product => (
            <div 
               key={product.id} 
               onClick={() => openProductDetails(product)}
               className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer group"
            >
               <div className="relative mb-3">
                  <img src={product.images[0]} className="w-full h-32 object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" alt={product.name} />
                  <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center">
                     <Star size={10} className="text-amber-500 fill-amber-500 mr-1"/>
                     <span className="text-[10px] font-bold text-gray-800">{product.rating}</span>
                  </div>
                  <button className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm text-secondary hover:bg-secondary hover:text-white transition-colors">
                     <Plus size={16} />
                  </button>
               </div>
               <h3 className="font-bold text-xs text-gray-800 line-clamp-2 mb-1 flex-1">{product.name}</h3>
               <p className="text-xs text-gray-400 mb-2">{product.category}</p>
               <div className="mt-auto flex justify-between items-center">
                  <span className="font-extrabold text-sm text-gray-900">{product.price.toLocaleString()} UZS</span>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};