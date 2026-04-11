import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, MessageCircle, QrCode, Clock, Video, Ticket, CalendarDays, Plus, TrendingUp, ShoppingBag, CreditCard, Mic, MicOff, VideoOff, PhoneOff, Paperclip, Star, Image as ImageIcon, Camera, ChevronRight, Check, AlertTriangle, User, Smile, Activity, BookOpen, Save, Minus, Trash2, MapPin, Search, Phone, ShieldCheck, Wallet } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getGeminiResponse } from '../services/geminiService';
import { MOCK_REVIEWS, MOCK_ACTIVITIES } from '../constants';
import { Service } from '../types';

// ... (AIAssistant remains unchanged) ...
export const AIAssistant = () => {
  const { uiState, openChat, closeChat, institutions, doctors } = useAppContext();
  const location = useLocation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Привет! Я AI помощник KidSpace. Я могу помочь найти школу, врача или развлечения.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, uiState.isChatOpen]);

  useEffect(() => {
    if (uiState.isChatOpen && uiState.chatTriggerMsg) {
      handleSend(uiState.chatTriggerMsg);
    }
  }, [uiState.isChatOpen, uiState.chatTriggerMsg]);

  const handleSend = async (textOverride?: string) => {
    const userMsg = textOverride || input;
    if (!userMsg.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    if (!textOverride) setInput('');
    setIsLoading(true);

    const response = await getGeminiResponse(userMsg, { 
      institutions: institutions, 
      reviews: MOCK_REVIEWS,
      doctors: doctors,
      activities: MOCK_ACTIVITIES
    });
    
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setIsLoading(false);
  };

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <>
      {!uiState.isChatOpen && (
        <button 
          onClick={() => openChat()}
          className="fixed bottom-20 right-4 bg-gradient-to-r from-primary to-blue-600 text-white p-4 rounded-full shadow-xl z-40 hover:scale-105 transition-transform border-2 border-white"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {uiState.isChatOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md h-[80vh] sm:h-[600px] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden animate-slide-up shadow-2xl">
            <div className="bg-primary p-4 flex justify-between items-center text-white">
              <h3 className="font-bold">KidSpace AI Помощник</h3>
              <button onClick={closeChat} className="text-white hover:text-gray-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                    m.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && <div className="text-xs text-gray-500 ml-2">Думаю...</div>}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t bg-white flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Спросите о школах, здоровье..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={() => handleSend()} className="bg-primary text-white p-2 rounded-full hover:bg-indigo-600 transition-colors">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- Payment Modal ---
export const PaymentModal = () => {
  const { toggleModal, paymentConfig, processPayment, closeAllModals, walletBalance } = useAppContext();
  const [method, setMethod] = useState<'wallet' | 'click' | 'payme' | 'uzum'>('wallet');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!paymentConfig) return null;

  const handlePay = async () => {
    setStatus('processing');
    setErrorMsg('');
    
    try {
      const result = await processPayment(method);
      if (result.success) {
        setStatus('success');
        setTimeout(() => {
          paymentConfig.onSuccess();
          closeAllModals(); // Close payment modal and any underlying modal
        }, 2000);
      } else {
        setStatus('error');
        setErrorMsg(result.message || 'Ошибка платежа');
      }
    } catch (e) {
      setStatus('error');
      setErrorMsg('Произошла ошибка системы');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[110] flex items-center justify-center p-4 animate-fade-in" onClick={() => toggleModal('payment')}>
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
         
         {/* Close Button */}
         {status !== 'processing' && status !== 'success' && (
            <button onClick={() => toggleModal('payment')} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
               <X size={24} />
            </button>
         )}

         {/* Content based on status */}
         {status === 'idle' && (
            <>
               <div className="text-center mb-6 mt-2">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                     <CreditCard size={32} />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-1">Оплата</h3>
                  <p className="text-sm text-gray-500">{paymentConfig.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{paymentConfig.description}</p>
               </div>

               <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-center border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Сумма к оплате</p>
                  <p className="text-3xl font-extrabold text-gray-900">{paymentConfig.amount.toLocaleString()} <span className="text-sm font-medium text-gray-500">UZS</span></p>
               </div>

               <div className="space-y-3 mb-6">
                  <button 
                     onClick={() => setMethod('wallet')}
                     className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${method === 'wallet' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                     <div className="flex items-center">
                        <Wallet size={20} className={`mr-3 ${method === 'wallet' ? 'text-primary' : 'text-gray-400'}`}/>
                        <div className="text-left">
                           <p className={`font-bold text-sm ${method === 'wallet' ? 'text-gray-900' : 'text-gray-600'}`}>Мой Кошелек</p>
                           <p className="text-[10px] text-gray-500">Баланс: {walletBalance?.toLocaleString()} UZS</p>
                        </div>
                     </div>
                     {method === 'wallet' && <div className="w-4 h-4 rounded-full bg-primary"></div>}
                  </button>

                  <div className="grid grid-cols-3 gap-3">
                     {['click', 'payme', 'uzum'].map((m) => (
                        <button 
                           key={m}
                           onClick={() => setMethod(m as any)}
                           className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${method === m ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                           <span className="font-bold text-sm capitalize text-gray-700">{m}</span>
                        </button>
                     ))}
                  </div>
               </div>

               <button 
                  onClick={handlePay}
                  disabled={method === 'wallet' && walletBalance < paymentConfig.amount}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-transform active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <ShieldCheck size={18} className="mr-2"/> Оплатить
               </button>
            </>
         )}

         {status === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
               <h3 className="text-lg font-bold text-gray-900 mb-1">Обработка платежа...</h3>
               <p className="text-sm text-gray-500">Пожалуйста, подождите</p>
            </div>
         )}

         {status === 'success' && (
            <div className="py-10 flex flex-col items-center justify-center text-center animate-scale-in">
               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-sm">
                  <Check size={40} strokeWidth={3} />
               </div>
               <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Успешно!</h3>
               <p className="text-sm text-gray-500 mb-1">Ваш платеж принят</p>
               <p className="font-bold text-gray-800">{paymentConfig.amount.toLocaleString()} UZS</p>
            </div>
         )}

         {status === 'error' && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
                  <X size={32} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">Ошибка</h3>
               <p className="text-sm text-gray-500 mb-6 px-4">{errorMsg}</p>
               <button 
                  onClick={() => setStatus('idle')}
                  className="bg-gray-100 text-gray-800 font-bold py-3 px-8 rounded-xl hover:bg-gray-200"
               >
                  Попробовать снова
               </button>
            </div>
         )}
      </div>
    </div>
  );
};

// ... ChatListModal, ChatRoomModal ... (UNCHANGED)
export const ChatListModal = () => {
  const { toggleModal, chatSessions, activeChatId, openChatWith, t } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'support' | 'doctor' | 'institution'>('all');

  const filteredChats = filter === 'all' 
    ? chatSessions 
    : chatSessions.filter(c => c.type === filter);

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => toggleModal('chat_list')}>
      <div className="bg-white w-full sm:max-w-md h-[85vh] sm:h-[700px] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-slide-up flex flex-col" onClick={e => e.stopPropagation()}>
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">{t('myChats')}</h3>
            <button onClick={() => toggleModal('chat_list')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
         </div>

         {/* Search & Tabs */}
         <div className="mb-4">
            <div className="relative mb-4">
               <input type="text" placeholder="Поиск сообщений..." className="w-full bg-gray-50 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"/>
               <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
               {['all', 'support', 'doctor', 'institution'].map((f) => (
                  <button 
                     key={f} 
                     onClick={() => setFilter(f as any)}
                     className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors ${filter === f ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                     {f === 'all' ? t('all') : f}
                  </button>
               ))}
            </div>
         </div>

         {/* Chat List */}
         <div className="flex-1 overflow-y-auto space-y-2">
            {filteredChats.length > 0 ? filteredChats.map(chat => (
               <div 
                  key={chat.id} 
                  onClick={() => openChatWith(chat.type, { id: chat.participantId } as any)} // Hack: mocking entity object with just ID for lookup
                  className="flex items-center p-3 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-gray-100"
               >
                  <div className="relative mr-4">
                     <img src={chat.participantAvatar} className="w-12 h-12 rounded-full object-cover bg-gray-100" alt={chat.participantName}/>
                     {chat.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-gray-900 text-sm truncate pr-2">{chat.participantName}</h4>
                        <span className="text-[10px] text-gray-400 shrink-0">{chat.lastMessageTime}</span>
                     </div>
                     <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unreadCount > 0 && (
                     <div className="ml-3 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {chat.unreadCount}
                     </div>
                  )}
               </div>
            )) : (
               <div className="text-center py-10 text-gray-400 text-sm">Нет активных чатов</div>
            )}
         </div>
      </div>
    </div>
  );
};

export const ChatRoomModal = () => {
  const { toggleModal, activeChatId, chatSessions, sendMessage, t } = useAppContext();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = chatSessions.find(c => c.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  if (!chat) return null;

  const handleSend = () => {
    if(input.trim()) {
      sendMessage(chat.id, input);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => toggleModal('chat_room')}>
      <div className="bg-white w-full sm:max-w-md h-[100dvh] sm:h-[700px] sm:rounded-3xl rounded-none flex flex-col shadow-2xl animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
         {/* Header */}
         <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10 shadow-sm">
            <div className="flex items-center">
               <button onClick={() => toggleModal('chat_room')} className="mr-3 text-gray-600 hover:bg-gray-100 p-1 rounded-full"><ChevronRight size={24} className="rotate-180"/></button>
               <div className="relative mr-3">
                  <img src={chat.participantAvatar} className="w-10 h-10 rounded-full object-cover" alt={chat.participantName}/>
                  {chat.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>}
               </div>
               <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{chat.participantName}</h3>
                  <p className="text-[10px] text-gray-500">{chat.participantRole || (chat.isOnline ? 'Online' : 'Offline')}</p>
               </div>
            </div>
            <div className="flex gap-2 text-primary">
               <button className="p-2 hover:bg-indigo-50 rounded-full transition-colors"><Phone size={20}/></button>
               <button className="p-2 hover:bg-indigo-50 rounded-full transition-colors"><Video size={20}/></button>
            </div>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {chat.messages.map((msg, idx) => (
               <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm relative group ${
                     msg.senderId === 'me' 
                        ? 'bg-primary text-white rounded-br-none' 
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                  }`}>
                     <p>{msg.text}</p>
                     <span className={`text-[9px] block text-right mt-1 opacity-70 ${msg.senderId === 'me' ? 'text-indigo-100' : 'text-gray-400'}`}>
                        {msg.timestamp}
                     </span>
                  </div>
               </div>
            ))}
            <div ref={messagesEndRef} />
         </div>

         {/* Input */}
         <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 safe-area-bottom">
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><Paperclip size={20}/></button>
            <input 
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder={t('sendMessage')}
               className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
               onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
               onClick={handleSend}
               disabled={!input.trim()}
               className="p-2.5 bg-primary text-white rounded-xl shadow-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
               <Send size={18} />
            </button>
         </div>
      </div>
    </div>
  );
};

// ... CartModal (Updated), BookingCreationModal (Updated) ...

export const CartModal = () => {
  const { toggleModal, cartItems, updateCartQuantity, removeFromCart, clearCart, openPayment, checkoutCart } = useAppContext();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [address, setAddress] = useState('Ташкент, Юнусабад, 14-2-33'); // Mock default
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePayment = () => {
    openPayment({
      amount: total,
      title: 'Заказ KidsMarket',
      description: `${cartItems.length} товаров`,
      type: 'Marketplace',
      onSuccess: async () => {
        const result = await checkoutCart(address);
        if (!result.success) {
          console.error(result.message);
        }
      }
    });
  };

  const renderCartItems = () => (
    <div className="space-y-4">
       {cartItems.map(item => (
          <div key={item.id} className="flex gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
             <img src={item.productImage} className="w-20 h-20 rounded-xl object-cover bg-gray-50" alt={item.productName}/>
             <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                   <h4 className="font-bold text-sm text-gray-900 line-clamp-2">{item.productName}</h4>
                   <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
                {item.selectedOptions && (
                   <div className="text-[10px] text-gray-500 mb-auto">
                      {Object.entries(item.selectedOptions).map(([key, val]) => `${key}: ${val}`).join(', ')}
                   </div>
                )}
                <div className="flex justify-between items-end mt-2">
                   <span className="font-bold text-secondary text-sm">{item.price.toLocaleString()} UZS</span>
                   <div className="flex items-center bg-gray-50 rounded-lg">
                      <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1.5 text-gray-600"><Minus size={14}/></button>
                      <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1.5 text-gray-600"><Plus size={14}/></button>
                   </div>
                </div>
             </div>
          </div>
       ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => toggleModal('cart')}>
      <div className="bg-white w-full sm:max-w-md h-[85vh] sm:h-auto sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-slide-up flex flex-col" onClick={e => e.stopPropagation()}>
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
               {step === 'cart' ? 'Корзина' : 'Оформление'}
            </h3>
            <button onClick={() => toggleModal('cart')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
         </div>

         <div className="flex-1 overflow-y-auto">
            {step === 'cart' && (
               <>
                  {cartItems.length > 0 ? renderCartItems() : (
                     <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                        <ShoppingBag size={48} className="mb-4 opacity-20"/>
                        <p>Корзина пуста</p>
                     </div>
                  )}
               </>
            )}

            {step === 'checkout' && (
               <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                     <h4 className="font-bold text-gray-800 mb-3 flex items-center"><MapPin size={16} className="mr-2"/> Адрес доставки</h4>
                     <textarea 
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-secondary/20 outline-none resize-none h-20"
                     />
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                     <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Товары ({cartItems.length})</span>
                        <span className="font-bold">{total.toLocaleString()} UZS</span>
                     </div>
                     <div className="flex justify-between text-sm mb-4">
                        <span className="text-gray-500">Доставка</span>
                        <span className="font-bold text-green-600">Бесплатно</span>
                     </div>
                     <div className="flex justify-between text-lg font-extrabold">
                        <span>Итого</span>
                        <span>{total.toLocaleString()} UZS</span>
                     </div>
                  </div>
               </div>
            )}
         </div>

         <div className="pt-4 mt-auto border-t border-gray-100">
            {step === 'cart' && cartItems.length > 0 && (
               <div className="flex gap-4 items-center">
                  <div className="flex-1">
                     <p className="text-xs text-gray-500">Итого</p>
                     <p className="text-xl font-extrabold text-gray-900">{total.toLocaleString()} UZS</p>
                  </div>
                  <button 
                     onClick={() => setStep('checkout')}
                     className="bg-secondary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-pink-600"
                  >
                     Оформить
                  </button>
               </div>
            )}

            {step === 'checkout' && (
               <button 
                  onClick={handlePayment}
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-slate-800"
               >
                  Оплатить {total.toLocaleString()} UZS
               </button>
            )}
         </div>
      </div>
    </div>
  );
};

export const BookingCreationModal = () => {
  const { toggleModal, bookingDraft, updateBookingDraft, openPayment, user, myChildren, createBooking } = useAppContext();
  const [step, setStep] = useState(1);

  const institution = bookingDraft.institution;
  if (!institution || !user) return null;

  // Mock Dates
  const dates = Array.from({length: 5}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      iso: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('ru-RU', {weekday: 'short'}),
      date: d.getDate()
    };
  });

  const timeSlots = ['10:00', '11:30', '14:00', '16:30', '18:00'];

  const handlePayDeposit = async () => {
    const amount = bookingDraft.service?.deposit || 0;
    
    if (amount > 0) {
      openPayment({
        amount,
        title: 'Бронирование места',
        description: `${institution.name} (${bookingDraft.service?.name})`,
        type: 'Booking',
        onSuccess: async () => {
          const res = await createBooking({
            institution_id: institution.id,
            course_id: bookingDraft.service?.id || 'general',
            course_name: bookingDraft.service?.name,
            child_id: bookingDraft.child?.id,
            date: bookingDraft.date,
            time: bookingDraft.time,
            price: amount
          });
          
          if (res.success) {
            toggleModal('booking_create');
            alert("Бронирование успешно создано!");
          } else {
            alert(res.message || "Ошибка при создании бронирования");
          }
        }
      });
    } else {
      // Free booking or no deposit required
      const res = await createBooking({
        institution_id: institution.id,
        course_id: bookingDraft.service?.id || 'general',
        course_name: bookingDraft.service?.name,
        child_id: bookingDraft.child?.id,
        date: bookingDraft.date,
        time: bookingDraft.time,
        price: 0
      });
      
      if (res.success) {
        toggleModal('booking_create');
        alert("Бронирование успешно создано!");
      } else {
        alert(res.message || "Ошибка при создании бронирования");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => toggleModal('booking_create')}>
      <div className="bg-white w-full sm:max-w-md h-[80vh] sm:h-auto sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-slide-up flex flex-col" onClick={e => e.stopPropagation()}>
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Бронирование</h3>
            <button onClick={() => toggleModal('booking_create')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
         </div>

         <div className="flex-1 overflow-y-auto">
            {step === 1 && (
               <div className="space-y-6">
                  {!bookingDraft.service && institution.services && (
                     <div>
                        <h4 className="font-bold text-gray-800 mb-3">Выберите услугу</h4>
                        <div className="space-y-2">
                           {institution.services.map(srv => (
                              <button 
                                 key={srv.id}
                                 onClick={() => updateBookingDraft({ service: srv })}
                                 className="w-full text-left p-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-primary/50 transition-colors flex justify-between items-center"
                              >
                                 <div>
                                    <p className="font-bold text-sm text-gray-900">{srv.name}</p>
                                    <p className="text-xs text-gray-500">{srv.duration ? `${srv.duration} мин` : 'Абонемент'}</p>
                                 </div>
                                 <span className="font-bold text-sm text-primary">{srv.price.toLocaleString()}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {bookingDraft.service && (
                     <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-center">
                        <div>
                           <p className="text-xs text-blue-500 font-bold uppercase">Услуга</p>
                           <p className="font-bold text-gray-900">{bookingDraft.service.name}</p>
                        </div>
                        <button onClick={() => updateBookingDraft({ service: null })} className="text-xs text-blue-600 font-bold">Изменить</button>
                     </div>
                  )}

                  <div>
                     <h4 className="font-bold text-gray-800 mb-3">Выберите дату</h4>
                     <div className="flex gap-2 overflow-x-auto pb-2">
                        {dates.map((d, idx) => (
                           <button 
                              key={idx}
                              onClick={() => updateBookingDraft({ date: d.iso })}
                              className={`flex flex-col items-center justify-center w-14 h-16 rounded-xl border shrink-0 transition-colors ${bookingDraft.date === d.iso ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600'}`}
                           >
                              <span className="text-xs capitalize">{d.day}</span>
                              <span className="text-lg font-bold">{d.date}</span>
                           </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <h4 className="font-bold text-gray-800 mb-3">Выберите время</h4>
                     <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map(time => (
                           <button 
                              key={time}
                              onClick={() => updateBookingDraft({ time })}
                              className={`py-2 rounded-lg text-sm font-bold border transition-colors ${bookingDraft.time === time ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600'}`}
                           >
                              {time}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {step === 2 && (
               <div className="space-y-6">
                  <div>
                     <h4 className="font-bold text-gray-800 mb-3">Кто пойдет?</h4>
                     <div className="space-y-2">
                        {myChildren.length > 0 ? myChildren.map(child => (
                           <button 
                              key={child.id}
                              onClick={() => updateBookingDraft({ child })}
                              className={`w-full flex items-center p-3 rounded-xl border transition-colors ${bookingDraft.child?.id === child.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}
                           >
                              <img src={child.image} className="w-10 h-10 rounded-full mr-3" alt={child.name}/>
                              <div className="text-left">
                                 <p className="font-bold text-sm text-gray-900">{child.name}</p>
                                 <p className="text-xs text-gray-500">{child.age} лет</p>
                              </div>
                              {bookingDraft.child?.id === child.id && <Check size={20} className="ml-auto text-blue-500"/>}
                           </button>
                        )) : (
                           <div className="text-sm text-gray-500 text-center py-4">Сначала добавьте ребенка в профиле</div>
                        )}
                     </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                     <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2">Итого</h4>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Дата и время</span>
                        <span className="font-bold text-gray-900">{bookingDraft.date} в {bookingDraft.time}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Услуга</span>
                        <span className="font-bold text-gray-900">{bookingDraft.service?.name}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Депозит (предоплата)</span>
                        <span className="font-bold text-primary">{bookingDraft.service?.deposit.toLocaleString()} UZS</span>
                     </div>
                     <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                        <span className="text-gray-800 font-bold">Полная стоимость</span>
                        <span className="font-bold text-gray-900">{bookingDraft.service?.price.toLocaleString()} UZS</span>
                     </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg flex items-start text-xs text-yellow-800">
                     <AlertTriangle size={16} className="mr-2 shrink-0 mt-0.5"/>
                     <div>
                        <span className="font-bold">Правила отмены:</span> {bookingDraft.service?.cancellationPolicy}.
                        <br/>При поздней отмене депозит не возвращается.
                     </div>
                  </div>
               </div>
            )}
         </div>

         <div className="pt-4 mt-auto border-t border-gray-100">
            {step === 1 ? (
               <button 
                  onClick={() => setStep(2)}
                  disabled={!bookingDraft.date || !bookingDraft.time || !bookingDraft.service}
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  Далее
               </button>
            ) : (
               <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="px-6 py-3.5 font-bold text-gray-600 bg-gray-100 rounded-xl">Назад</button>
                  <button 
                     onClick={handlePayDeposit}
                     disabled={!bookingDraft.child}
                     className="flex-1 bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {(bookingDraft.service?.deposit || 0) > 0 ? 'Оплатить депозит' : 'Забронировать'}
                  </button>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export const BookingsModal = () => {
  const { toggleModal, t, myBookings, institutions, myChildren } = useAppContext();

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => toggleModal('bookings')}>
      <div className="bg-white w-full sm:max-w-md h-[85vh] sm:h-auto sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-slide-up flex flex-col" onClick={e => e.stopPropagation()}>
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">{t('book')}</h3>
            <button onClick={() => toggleModal('bookings')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
         </div>

         <div className="flex-1 overflow-y-auto space-y-4">
            {myBookings?.length > 0 ? myBookings.map(b => {
               const inst = institutions.find(i => i.id === b.institution_id);
               const child = myChildren.find(c => c.id === b.child_id);
               return (
               <div key={b.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                     <p className="font-bold text-sm text-gray-800">{b.course_name || 'Занятие'}</p>
                     <p className="text-xs text-gray-500">{inst?.name || 'Заведение'}</p>
                     <p className="text-xs text-gray-400 mt-1">{b.date} • {b.time}</p>
                     <p className="text-[10px] text-primary font-bold mt-1">{child?.name || 'Ребенок'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                     {b.status === 'confirmed' ? 'Активно' : 'Архив'}
                  </span>
               </div>
            )}) : (
               <div className="text-center py-10 text-gray-400 text-sm">Нет активных бронирований</div>
            )}
         </div>
      </div>
    </div>
  );
};

// ... other existing modals (Scan, Wallet, Notifications, etc.) ...
export const ScanModal = () => {
  const { toggleModal, t } = useAppContext();
  return (
    <div className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center p-4 animate-fade-in" onClick={() => toggleModal('scan')}>
      <div className="bg-transparent w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
        <div className="relative w-72 h-72 border-4 border-white rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.2)]">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-scan"></div>
           {/* Scan corners */}
           <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
           <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
           <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
           <div className="w-full h-full bg-black/30 flex items-center justify-center">
             <QrCode size={64} className="text-white/50" />
           </div>
        </div>
        <p className="text-white mt-8 font-bold text-lg">{t('scan')} QR</p>
        <button onClick={() => toggleModal('scan')} className="mt-8 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-bold backdrop-blur-md transition-colors">
          Закрыть
        </button>
      </div>
    </div>
  )
}

export const WalletModal = () => {
  const { toggleModal, t, walletBalance, userData, openPayment, topUpWallet } = useAppContext();
  
  const handleTopUp = () => {
    openPayment({
      amount: 50000, // Default top-up amount
      title: 'Пополнение кошелька',
      description: 'Пополнение баланса через внешнюю платежную систему',
      type: 'TopUp',
      onSuccess: async () => {
        await topUpWallet(50000);
      }
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4" onClick={() => toggleModal('wallet')}>
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold text-gray-900">{t('myWallet')}</h3>
          <button onClick={() => toggleModal('wallet')} className="p-1 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
        </div>
        
        <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 text-sm mb-1">{t('balance')}</p>
            <h2 className="text-3xl font-bold mb-4">{walletBalance?.toLocaleString()} UZS</h2>
            <div className="flex space-x-3">
              <button onClick={handleTopUp} className="flex-1 bg-white/20 hover:bg-white/30 transition-colors py-2 rounded-lg text-sm font-bold flex items-center justify-center backdrop-blur-sm">
                <Plus size={16} className="mr-1"/> {t('topUp')}
              </button>
              <button className="flex-1 bg-white/20 hover:bg-white/30 transition-colors py-2 rounded-lg text-sm font-bold flex items-center justify-center backdrop-blur-sm">
                <Send size={16} className="mr-1"/> {t('transfer')}
              </button>
            </div>
          </div>
          <CreditCard className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 rotate-12" />
        </div>

        <h4 className="font-bold text-gray-800 mb-3">{t('history')}</h4>
        <div className="space-y-3">
          {userData?.transactions?.slice(0, 3).map((tx: any) => (
            <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
               <div className="flex items-center">
                 <div className={`p-2 rounded-full mr-3 ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                   {tx.amount > 0 ? <TrendingUp size={16} /> : <ShoppingBag size={16} />}
                 </div>
                 <div>
                   <p className="font-bold text-sm text-gray-800">{tx.type}</p>
                   <p className="text-[10px] text-gray-400">{tx.date}</p>
                 </div>
               </div>
               <span className={`font-bold text-sm ${tx.status === 'Failed' ? 'text-gray-400 line-through' : ''}`}>
                 {tx.amount.toLocaleString()} UZS
               </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const NotificationsModal = () => {
  const { toggleModal, t, userData } = useAppContext();
  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4" onClick={() => toggleModal('notifications')}>
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold text-gray-900">{t('notifications')}</h3>
          <button onClick={() => toggleModal('notifications')} className="p-1 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
        </div>
        <div className="space-y-4">
          {userData?.notifications?.map((n: any) => (
            <div key={n.id} className={`p-3 rounded-xl border ${n.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex justify-between items-start">
                <h4 className={`font-bold text-sm ${n.read ? 'text-gray-700' : 'text-blue-800'}`}>{n.title}</h4>
                <span className="text-[10px] text-gray-400">{n.time}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{n.message}</p>
            </div>
          ))}
        </div>
        <button onClick={() => toggleModal('notifications')} className="w-full mt-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200">
          {t('readAll')}
        </button>
      </div>
    </div>
  );
};

export const DoctorConsultationModal = () => {
  const { toggleModal, selectedDoctor, userData, openPayment, buyHealthPass, startConsultation, openChatWith } = useAppContext();

  if (!selectedDoctor) return null;

  const healthPass = userData?.healthPass || {
    isActive: false,
    planName: 'Базовый',
    limit: 0,
    used: 0,
    expiryDate: 'Нет активной подписки'
  };

  const handleConsultation = (type: 'chat' | 'video') => {
    // If user has active Health+ and remaining consultations, use it
    if (healthPass.isActive && healthPass.used < healthPass.limit) {
      startConsultation(selectedDoctor, type);
      openChatWith('doctor', selectedDoctor);
      toggleModal('doctor_consultation');
      return;
    }

    const price = type === 'video' ? selectedDoctor.price * 1.5 : selectedDoctor.price;
    openPayment({
      amount: price,
      title: type === 'video' ? 'Видеоконсультация' : 'Чат с врачом',
      description: `${selectedDoctor.name} (${selectedDoctor.specialty})`,
      type: 'Consultation',
      onSuccess: async () => {
        await startConsultation(selectedDoctor, type);
        openChatWith('doctor', selectedDoctor);
      }
    });
    toggleModal('doctor_consultation');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => toggleModal('doctor_consultation')}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Запись к врачу</h3>
            <button onClick={() => toggleModal('doctor_consultation')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
         </div>

         <div className="flex items-center mb-6">
            <img src={selectedDoctor.image} className="w-16 h-16 rounded-full object-cover mr-4" alt={selectedDoctor.name}/>
            <div>
               <h4 className="font-bold text-lg text-gray-900">{selectedDoctor.name}</h4>
               <p className="text-sm text-gray-500">{selectedDoctor.specialty} • {selectedDoctor.experience} лет стажа</p>
               <div className="flex items-center text-amber-500 text-xs font-bold mt-1">
                  <Star size={12} className="fill-amber-500 mr-1"/> {selectedDoctor.rating}
               </div>
            </div>
         </div>

         <div className="space-y-3 mb-6">
            <button 
               onClick={() => handleConsultation('chat')}
               className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/50 transition-colors"
            >
               <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3"><MessageCircle size={20}/></div>
                  <div className="text-left">
                     <p className="font-bold text-sm text-gray-900">Чат консультация</p>
                     <p className="text-xs text-gray-500">Ответ в течение 15 мин</p>
                  </div>
               </div>
               <span className="font-bold text-sm text-primary">{selectedDoctor.price.toLocaleString()} UZS</span>
            </button>
            <button 
               onClick={() => handleConsultation('video')}
               className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/50 transition-colors"
            >
               <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full text-green-600 mr-3"><Video size={20}/></div>
                  <div className="text-left">
                     <p className="font-bold text-sm text-gray-900">Видеозвонок</p>
                     <p className="text-xs text-gray-500">30 минут</p>
                  </div>
               </div>
               <span className="font-bold text-sm text-primary">{(selectedDoctor.price * 1.5).toLocaleString()} UZS</span>
            </button>
         </div>

         <p className="text-[10px] text-gray-400 text-center">
            {healthPass.isActive && healthPass.used < healthPass.limit 
               ? `У вас осталось ${healthPass.limit - healthPass.used} бесплатных консультаций` 
               : 'Консультация будет оплачена с кошелька или через платежную систему'}
         </p>
      </div>
    </div>
  );
};

// ... AddReviewModal, ChildProfileModal, ProductDetailsModal ... (UNCHANGED)
export const AddReviewModal = () => {
  const { toggleModal, reviewTargetId, institutions } = useAppContext();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const institution = institutions.find(i => i.id === reviewTargetId);

  const handleAddPhoto = () => {
    const newPhoto = `https://picsum.photos/300/200?random=${Date.now()}`;
    setPhotos([...photos, newPhoto]);
  };

  const handleSubmit = () => {
    if (rating === 0) return alert("Пожалуйста, поставьте оценку");
    alert("Спасибо! Ваш отзыв отправлен на модерацию.");
    toggleModal('add_review');
  };

  if (!institution) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => toggleModal('add_review')}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Написать отзыв</h3>
            <button onClick={() => toggleModal('add_review')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
         </div>

         <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Оцените {institution.name}</p>
            <div className="flex gap-2">
               {[1, 2, 3, 4, 5].map(star => (
                  <button 
                     key={star} 
                     onClick={() => setRating(star)}
                     className="transition-transform hover:scale-110 focus:outline-none"
                  >
                     <Star size={32} className={`${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  </button>
               ))}
            </div>
         </div>

         <div className="mb-4">
            <textarea 
               value={text}
               onChange={e => setText(e.target.value)}
               placeholder="Расскажите о вашем опыте... (педагоги, чистота, еда)"
               className="w-full bg-gray-50 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none h-32 resize-none"
            />
         </div>

         <div className="mb-6">
            <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
               {photos.map((photo, idx) => (
                  <div key={idx} className="w-16 h-16 rounded-lg relative shrink-0">
                     <img src={photo} className="w-full h-full object-cover rounded-lg" alt="Upload" />
                     <button onClick={() => setPhotos(photos.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10}/></button>
                  </div>
               ))}
               <button onClick={handleAddPhoto} className="w-16 h-16 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 shrink-0">
                  <Camera size={20} className="mb-1" />
                  <span className="text-[9px]">Фото</span>
               </button>
            </div>
         </div>

         <button 
            onClick={handleSubmit}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
         >
            Отправить отзыв
         </button>
      </div>
    </div>
  );
};

export const ProductDetailsModal = () => {
  const { toggleModal, selectedProduct, addToCart } = useAppContext();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState<Record<string, string>>({});

  if (!selectedProduct) return null;

  useEffect(() => {
    if (selectedProduct.options) {
      const initialOptions: Record<string, string> = {};
      selectedProduct.options.forEach(opt => {
        initialOptions[opt.name] = opt.values[0];
      });
      setOptions(initialOptions);
    }
  }, [selectedProduct]);

  const handleOptionSelect = (optionName: string, value: string) => {
    setOptions(prev => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity, options);
    toggleModal('product_details');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => toggleModal('product_details')}>
      <div className="bg-white w-full sm:max-w-md h-[90vh] sm:h-auto sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-slide-up flex flex-col" onClick={e => e.stopPropagation()}>
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Товар</h3>
            <button onClick={() => toggleModal('product_details')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
         </div>

         <div className="flex-1 overflow-y-auto">
            {/* Image Gallery */}
            <div className="mb-6">
               <div className="w-full h-64 bg-gray-50 rounded-2xl mb-2 overflow-hidden flex items-center justify-center">
                  <img src={selectedProduct.images[selectedImage]} className="h-full object-contain" alt={selectedProduct.name} />
               </div>
               {selectedProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                     {selectedProduct.images.map((img, idx) => (
                        <button 
                           key={idx} 
                           onClick={() => setSelectedImage(idx)}
                           className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 ${selectedImage === idx ? 'border-secondary' : 'border-transparent'}`}
                        >
                           <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
                        </button>
                     ))}
                  </div>
               )}
            </div>

            <div className="mb-6">
               <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-extrabold text-gray-900 leading-tight flex-1 mr-4">{selectedProduct.name}</h2>
                  <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg">
                     <Star size={14} className="text-amber-500 fill-amber-500 mr-1"/>
                     <span className="text-xs font-bold text-amber-700">{selectedProduct.rating}</span>
                  </div>
               </div>
               <p className="text-2xl font-bold text-secondary mb-4">{selectedProduct.price.toLocaleString()} UZS</p>
               
               <p className="text-sm text-gray-600 leading-relaxed mb-6">{selectedProduct.description}</p>

               {/* Options Selector */}
               {selectedProduct.options?.map(opt => (
                  <div key={opt.name} className="mb-4">
                     <p className="text-xs font-bold text-gray-500 mb-2 uppercase">{opt.name}</p>
                     <div className="flex flex-wrap gap-2">
                        {opt.values.map(val => (
                           <button
                              key={val}
                              onClick={() => handleOptionSelect(opt.name, val)}
                              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${options[opt.name] === val ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-700 border-gray-200'}`}
                           >
                              {val}
                           </button>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Footer Actions */}
         <div className="pt-4 mt-auto border-t border-gray-100 flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-xl px-2">
               <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray-600"><Minus size={18}/></button>
               <span className="text-lg font-bold w-8 text-center">{quantity}</span>
               <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-gray-600"><Plus size={18}/></button>
            </div>
            <button 
               onClick={handleAddToCart}
               className="flex-1 bg-secondary text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-pink-600 flex items-center justify-center"
            >
               <ShoppingBag size={18} className="mr-2"/> В корзину
            </button>
         </div>
      </div>
    </div>
  );
};

export const ChildProfileModal = () => {
  const { toggleModal, selectedChild, addChild, updateChild } = useAppContext();
  const [name, setName] = useState(selectedChild?.name || '');
  const [age, setAge] = useState(selectedChild?.age?.toString() || '');
  const [gender, setGender] = useState<'boy' | 'girl'>(selectedChild?.gender || 'boy');
  const [interests, setInterests] = useState<string[]>(selectedChild?.interests || []);
  const [newInterest, setNewInterest] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when modal opens/closes or selectedChild changes
  useEffect(() => {
    setName(selectedChild?.name || '');
    setAge(selectedChild?.age?.toString() || '');
    setGender(selectedChild?.gender || 'boy');
    setInterests(selectedChild?.interests || []);
    setNewInterest('');
  }, [selectedChild]);

  const handleAddInterest = () => {
    if(newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !age.trim()) {
      alert('Пожалуйста, заполните имя и возраст');
      return;
    }
    
    setIsSaving(true);
    try {
      if (!selectedChild) {
        // Adding new child
        await addChild({
          name: name.trim(),
          age: parseInt(age),
          gender,
          interests
        });
        alert('Ребенок успешно добавлен!');
      } else {
        // Edit existing child
        await updateChild(selectedChild.id, {
          name: name.trim(),
          age: parseInt(age),
          gender,
          interests
        });
        alert('Данные сохранены!');
      }
      toggleModal('child_profile');
    } catch (error) {
      alert('Ошибка при сохранении');
    } finally {
      setIsSaving(false);
    }
  };

  const isNew = !selectedChild;

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => toggleModal('child_profile')}>
      <div className="bg-white w-full sm:max-w-md h-[85vh] sm:h-auto sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-slide-up flex flex-col" onClick={e => e.stopPropagation()}>
         {/* Header */}
         <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
               <div className="relative">
                  <img src={selectedChild?.image || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png'} className="w-16 h-16 rounded-full border-4 border-gray-50 object-cover mr-4" alt="Avatar"/>
                  <button className="absolute bottom-0 right-3 bg-gray-900 text-white rounded-full p-1 border-2 border-white"><Camera size={12}/></button>
               </div>
               <div>
                  {isNew ? (
                    <h3 className="text-xl font-extrabold text-gray-900">Новый профиль</h3>
                  ) : (
                    <>
                      <h3 className="text-xl font-extrabold text-gray-900">{selectedChild.name}</h3>
                      <p className="text-sm text-gray-500">{selectedChild.age} лет • {selectedChild.gender === 'boy' ? 'Мальчик' : 'Девочка'}</p>
                    </>
                  )}
               </div>
            </div>
            <button onClick={() => toggleModal('child_profile')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
         </div>

         <div className="flex-1 overflow-y-auto space-y-6">
            {/* Basic Info Form */}
            <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Имя ребенка</label>
                 <input 
                   type="text" 
                   value={name} 
                   onChange={e => setName(e.target.value)} 
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                   placeholder="Например, Амир"
                 />
               </div>
               <div className="flex gap-4">
                 <div className="flex-1">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Возраст</label>
                   <input 
                     type="number" 
                     value={age} 
                     onChange={e => setAge(e.target.value)} 
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                     placeholder="Лет"
                   />
                 </div>
                 <div className="flex-1">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Пол</label>
                   <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                     <button 
                       onClick={() => setGender('boy')}
                       className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${gender === 'boy' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                     >
                       Мальчик
                     </button>
                     <button 
                       onClick={() => setGender('girl')}
                       className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${gender === 'girl' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500 hover:bg-gray-100'}`}
                     >
                       Девочка
                     </button>
                   </div>
                 </div>
               </div>
            </div>

            {/* Stats Cards (Only for existing) */}
            {!isNew && selectedChild && (
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <p className="text-xs text-orange-600 font-bold mb-1 flex items-center"><Activity size={14} className="mr-1"/> Активность</p>
                    <p className="text-2xl font-extrabold text-gray-800">{selectedChild.activityLevel}%</p>
                    <div className="w-full h-1.5 bg-orange-200 rounded-full mt-2 overflow-hidden">
                       <div className="h-full bg-orange-500 rounded-full" style={{width: `${selectedChild.activityLevel}%`}}></div>
                    </div>
                 </div>
                 <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold mb-1 flex items-center"><BookOpen size={14} className="mr-1"/> Посещаемость</p>
                    <p className="text-2xl font-extrabold text-gray-800">{selectedChild.stats.attendanceRate}%</p>
                    <div className="w-full h-1.5 bg-blue-200 rounded-full mt-2 overflow-hidden">
                       <div className="h-full bg-blue-500 rounded-full" style={{width: `${selectedChild.stats.attendanceRate}%`}}></div>
                    </div>
                 </div>
              </div>
            )}

            {/* Interests Editor */}
            <div>
               <h4 className="font-bold text-gray-800 mb-2 flex items-center"><Smile size={16} className="mr-2 text-primary"/> Интересы</h4>
               <div className="flex flex-wrap gap-2 mb-3">
                  {interests.map((tag, idx) => (
                     <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                        {tag} <button onClick={() => setInterests(interests.filter(i => i !== tag))} className="ml-2 hover:text-red-500"><X size={10}/></button>
                     </span>
                  ))}
               </div>
               <div className="flex gap-2">
                  <input 
                     value={newInterest}
                     onChange={e => setNewInterest(e.target.value)}
                     placeholder="Добавить (напр. Шахматы)"
                     className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                     onKeyDown={e => e.key === 'Enter' && handleAddInterest()}
                  />
                  <button onClick={handleAddInterest} className="bg-gray-900 text-white p-2 rounded-xl"><Plus size={18}/></button>
               </div>
            </div>

            {/* History Preview (Only for existing) */}
            {!isNew && selectedChild && selectedChild.activityHistory && selectedChild.activityHistory.length > 0 && (
               <div>
                  <h4 className="font-bold text-gray-800 mb-2">Последние активности</h4>
                  <div className="space-y-2">
                     {selectedChild.activityHistory.slice(0, 3).map(act => (
                        <div key={act.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                           <div>
                              <p className="text-xs font-bold text-gray-800">{act.title}</p>
                              <p className="text-[10px] text-gray-500">{act.location}</p>
                           </div>
                           <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${act.status === 'attended' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {act.date}
                           </span>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>

         <div className="pt-4 mt-auto border-t border-gray-100">
            <button 
               onClick={handleSave}
               disabled={isSaving}
               className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-slate-800 flex items-center justify-center disabled:opacity-50"
            >
               <Save size={18} className="mr-2"/> {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
         </div>
      </div>
    </div>
  );
};