import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Doctor, Institution, Service, Child, Product, CartItem, ChatSession, ChatMessage, Booking } from '../types';
import { MOCK_INSTITUTIONS, MOCK_PRODUCTS, MOCK_DOCTORS } from '../constants';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, setDoc, updateDoc, increment } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Types ---
type Language = 'ru' | 'uz';

interface UIState {
  isChatOpen: boolean;
  activeModal: 'none' | 'scan' | 'bookings' | 'wallet' | 'notifications' | 'doctor_consultation' | 'add_review' | 'booking_create' | 'child_profile' | 'cart' | 'product_details' | 'chat_list' | 'chat_room' | 'payment';
  chatTriggerMsg: string;
}

interface BookingDraft {
  institution: Institution | null;
  service: Service | null;
  date: string | null;
  time: string | null;
  child: Child | null;
}

interface PaymentConfig {
  amount: number;
  title: string;
  description: string;
  type: 'Subscription' | 'Marketplace' | 'Booking' | 'Consultation';
  onSuccess: () => void;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['ru']) => string;
  
  // Auth & Data
  user: User | null;
  userData: any | null;
  myChildren: Child[];
  walletBalance: number;
  institutions: Institution[];
  products: Product[];
  doctors: Doctor[];
  myBookings: any[]; // Or define Booking type properly
  login: () => Promise<void>;
  logout: () => Promise<void>;
  addChild: (childData: Partial<Child>) => Promise<void>;
  updateChild: (childId: string, childData: Partial<Child>) => Promise<void>;
  createBooking: (bookingData: any) => Promise<{ success: boolean; message?: string }>;
  
  // UI Controls
  uiState: UIState;
  selectedDoctor: Doctor | null; 
  selectedChild: Child | null;   
  selectedProduct: Product | null; 
  reviewTargetId: string | null;
  bookingDraft: BookingDraft;
  paymentConfig: PaymentConfig | null;
  
  openChat: (msg?: string) => void; // AI Chat
  closeChat: () => void;
  toggleModal: (modal: UIState['activeModal']) => void;
  closeAllModals: () => void;
  
  // Actions
  openDoctorConsultation: (doctor: Doctor) => void; 
  openChildProfile: (child: Child) => void;
  openAddChildModal: () => void;
  openProductDetails: (product: Product) => void;
  openReviewModal: (institutionId: string) => void;
  startBooking: (institution: Institution, service?: Service) => void;
  updateBookingDraft: (updates: Partial<BookingDraft>) => void;

  // Cart
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, options?: Record<string, string>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;

  // Chats
  chatSessions: ChatSession[];
  activeChatId: string | null;
  openChatList: () => void;
  openChatWith: (type: 'support' | 'doctor' | 'institution', entity: Doctor | Institution | null) => void;
  sendMessage: (chatId: string, text: string) => void;

  // Payments
  openPayment: (config: PaymentConfig) => void;
  processPayment: (method: 'wallet' | 'click' | 'payme' | 'uzum') => Promise<{ success: boolean; message?: string }>;
  topUpWallet: (amount: number) => Promise<{ success: boolean; message?: string }>;
  buyPass: (pkg: PassPackage) => Promise<{ success: boolean; message?: string }>;
  buyHealthPass: (amount: number) => Promise<{ success: boolean; message?: string }>;
  startConsultation: (doctor: Doctor, type: 'chat' | 'video') => Promise<{ success: boolean; message?: string }>;
  checkoutCart: (address: string) => Promise<{ success: boolean; message?: string }>;
}

// --- Translations ---
const translations = {
  ru: {
    home: 'Главная',
    education: 'Обучение',
    pass: 'Pass',
    health: 'Здоровье',
    profile: 'Профиль',
    searchPlaceholder: 'Поиск школ, врачей, игрушек...',
    dailyTip: 'Совет дня',
    nearYou: 'Рядом с вами',
    openMap: 'Открыть карту',
    kidsMarket: 'Детский Маркет',
    toShop: 'В магазин',
    all: 'Все',
    myWallet: 'Мой Кошелек',
    balance: 'Общий баланс',
    topUp: 'Пополнить',
    transfer: 'Перевести',
    history: 'История операций',
    notifications: 'Уведомления',
    readAll: 'Прочитать все',
    bookVisit: 'Записаться',
    book: 'Брони',
    support: 'Поддержка',
    scan: 'Сканер',
    myKids: 'Мои Дети',
    add: 'Добавить',
    favorites: 'Избранное',
    myReviews: 'Мои Отзывы',
    logout: 'Выйти',
    bannerTitle: 'Выведите семейный отдых на новый уровень!',
    bannerSub: 'Скидки на зоопарки, парки, кино и рестораны. Экономьте с Kidspace Pass!',
    joinPass: 'Купить Kidspace Pass',
    currentPlan: 'Текущий Пакет',
    active: 'Активен',
    inactive: 'Неактивен',
    remainingBalance: 'Остаток баланса',
    manageSubs: 'Управление',
    linkedChildren: 'Дети на абонементе',
    choosePackage: 'Выберите свой пакет',
    visitsCount: 'посещений',
    buyPackage: 'Купить Пакет',
    healthTitle: 'Здоровье',
    chatWithDoctor: 'Чат с Врачом',
    notificationSettings: 'Настройки Уведомлений',
    myChats: 'Мои Чаты',
    sendMessage: 'Написать сообщение'
  },
  uz: {
    home: 'Bosh sahifa',
    education: "Ta'lim",
    pass: 'Pass',
    health: 'Salomatlik',
    profile: 'Profil',
    searchPlaceholder: "Maktab, shifokor, o'yinchoq qidirish...",
    dailyTip: 'Kun maslahati',
    nearYou: 'Yaqiningizda',
    openMap: 'Xaritani ochish',
    kidsMarket: "Bolalar Do'koni",
    toShop: "Do'konga",
    all: 'Barchasi',
    myWallet: 'Mening Hamyonim',
    balance: 'Umumiy balans',
    topUp: "To'ldirish",
    transfer: "O'tkazish",
    history: 'Amaliyotlar tarixi',
    notifications: 'Bildirishnomalar',
    readAll: "O'qib chiqish",
    bookVisit: 'Yozilish',
    book: 'Band qilish',
    support: "Qo'llab-quvvatlash",
    scan: 'Skaner',
    myKids: 'Farzandlarim',
    add: "Qo'shish",
    favorites: 'Tanlanganlar',
    myReviews: 'Sharhlarim',
    logout: 'Chiqish',
    bannerTitle: 'Oilaviy dam olishni yangi darajaga olib chiqing!',
    bannerSub: "Bog'lar, hayvonot bog'lari va kinoteatrlarga chegirmalar. Kidspace Pass bilan tejang!",
    joinPass: 'Kidspace Pass sotib olish',
    currentPlan: 'Joriy Tarif',
    active: 'Faol',
    inactive: 'Faol emas',
    remainingBalance: 'Balans qoldig\'i',
    manageSubs: 'Boshqarish',
    linkedChildren: 'Abonementdagi bolalar',
    choosePackage: 'Paketingizni tanlang',
    visitsCount: 'tashrif',
    buyPackage: 'Paket Sotib Olish',
    healthTitle: 'Salomatlik',
    chatWithDoctor: 'Shifokor bilan chat',
    notificationSettings: 'Bildirishnoma Sozlamalari',
    myChats: 'Mening Chatlarim',
    sendMessage: 'Xabar yozish'
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [myChildren, setMyChildren] = useState<Child[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [language, setLanguage] = useState<Language>('ru');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviewTargetId, setReviewTargetId] = useState<string | null>(null);
  const [uiState, setUiState] = useState<UIState>({
    isChatOpen: false,
    activeModal: 'none',
    chatTriggerMsg: ''
  });
  
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>({
    institution: null,
    service: null,
    date: null,
    time: null,
    child: null
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  // Payment State
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);

  useEffect(() => {
    // Fetch institutions globally
    const unsubscribeInstitutions = onSnapshot(collection(db, 'institutions'), (snapshot) => {
      if (snapshot.empty) {
        // Seed institutions if empty
        MOCK_INSTITUTIONS.forEach(inst => {
          setDoc(doc(db, 'institutions', inst.id), inst).catch(console.error);
        });
      } else {
        const instData: Institution[] = [];
        snapshot.forEach(doc => instData.push({ id: doc.id, ...doc.data() } as Institution));
        setInstitutions(instData);
      }
    }, (error) => console.error("Error fetching institutions:", error));

    // Fetch products globally
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (snapshot.empty) {
        // Seed products if empty
        MOCK_PRODUCTS.forEach(prod => {
          setDoc(doc(db, 'products', prod.id), prod).catch(console.error);
        });
      } else {
        const prodData: Product[] = [];
        snapshot.forEach(doc => prodData.push({ id: doc.id, ...doc.data() } as Product));
        setProducts(prodData);
      }
    }, (error) => console.error("Error fetching products:", error));

    // Fetch doctors globally
    const unsubscribeDoctors = onSnapshot(collection(db, 'doctors'), (snapshot) => {
      if (snapshot.empty) {
        // Seed doctors if empty
        MOCK_DOCTORS.forEach(docData => {
          setDoc(doc(db, 'doctors', docData.id), docData).catch(console.error);
        });
      } else {
        const docData: Doctor[] = [];
        snapshot.forEach(doc => docData.push({ id: doc.id, ...doc.data() } as Doctor));
        setDoctors(docData);
      }
    }, (error) => console.error("Error fetching doctors:", error));

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Ensure user document exists
        const userRef = doc(db, 'users', currentUser.uid);
        setDoc(userRef, {
          name: currentUser.displayName,
          email: currentUser.email,
          avatar_url: currentUser.photoURL,
          role: 'parent',
          last_login: serverTimestamp()
        }, { merge: true }).catch(error => handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`));

        // Listen to user document for wallet balance and other data
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setWalletBalance(data.wallet_balance || 0);
            setUserData(data);
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`));

        // Listen to children
        const q = query(collection(db, 'children'), where('parent_id', '==', currentUser.uid));
        const unsubscribeChildren = onSnapshot(q, (snapshot) => {
          const childrenData: Child[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            childrenData.push({
              id: doc.id,
              name: data.name || '',
              age: data.age || 0,
              gender: data.gender || 'boy',
              image: data.photo_url || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
              interests: data.interests || [],
              activityLevel: data.stats?.activity_level || 0,
              stats: {
                attendanceRate: data.stats?.attendance_rate || 0,
                completedCourses: 0,
                averageScore: 0
              },
              activityHistory: []
            });
          });
          setMyChildren(childrenData);
        }, (error) => handleFirestoreError(error, OperationType.LIST, 'children'));
        
        // Listen to bookings
        const qBookings = query(collection(db, 'bookings'), where('user_id', '==', currentUser.uid));
        const unsubscribeBookings = onSnapshot(qBookings, (snapshot) => {
          const bookingsData: any[] = [];
          snapshot.forEach(doc => bookingsData.push({ id: doc.id, ...doc.data() }));
          setMyBookings(bookingsData);
        }, (error) => handleFirestoreError(error, OperationType.LIST, 'bookings'));

        return () => {
          unsubscribeChildren();
          unsubscribeUser();
          unsubscribeBookings();
        };
      } else {
        setMyChildren([]);
        setWalletBalance(0);
        setMyBookings([]);
        setUserData(null);
      }
    });
    return () => {
      unsubscribeAuth();
      unsubscribeInstitutions();
      unsubscribeProducts();
      unsubscribeDoctors();
    };
  }, []);

  const addChild = async (childData: Partial<Child>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'children'), {
        parent_id: user.uid,
        name: childData.name,
        age: childData.age || 5,
        gender: childData.gender || 'boy',
        photo_url: childData.image || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
        interests: childData.interests || [],
        stats: {
          activity_level: 0,
          attendance_rate: 0
        },
        created_at: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'children');
    }
  };

  const updateChild = async (childId: string, childData: Partial<Child>) => {
    if (!user) return;
    try {
      const childRef = doc(db, 'children', childId);
      await updateDoc(childRef, {
        name: childData.name,
        age: childData.age,
        gender: childData.gender,
        interests: childData.interests,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `children/${childId}`);
    }
  };

  const createBooking = async (bookingData: any) => {
    if (!user) return { success: false, message: 'User not authenticated' };
    
    try {
      // If there's a price, deduct from wallet
      if (bookingData.price > 0) {
        if (walletBalance < bookingData.price) {
          return { success: false, message: 'Недостаточно средств на кошельке' };
        }
        
        // Deduct from wallet
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          wallet_balance: increment(-bookingData.price)
        });
        
        // Log payment
        await addDoc(collection(db, 'payments'), {
          user_id: user.uid,
          amount: bookingData.price,
          type: 'Booking',
          method: 'wallet',
          description: `Оплата бронирования: ${bookingData.course_name || 'Занятие'}`,
          status: 'success',
          created_at: serverTimestamp()
        });
      }

      // Create booking
      await addDoc(collection(db, 'bookings'), {
        user_id: user.uid,
        institution_id: bookingData.institution_id,
        course_id: bookingData.course_id || 'general',
        course_name: bookingData.course_name || 'Занятие',
        child_id: bookingData.child_id,
        date: bookingData.date,
        time: bookingData.time,
        status: 'confirmed',
        price: bookingData.price || 0,
        created_at: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error("Error creating booking:", error);
      return { success: false, message: 'Ошибка при создании бронирования' };
    }
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const t = (key: keyof typeof translations['ru']) => translations[language][key] || key;

  const openChat = (msg?: string) => {
    setUiState(prev => ({ ...prev, isChatOpen: true, chatTriggerMsg: msg || '' }));
  };

  const closeChat = () => {
    setUiState(prev => ({ ...prev, isChatOpen: false, chatTriggerMsg: '' }));
  };

  const toggleModal = (modal: UIState['activeModal']) => {
    setUiState(prev => ({
      ...prev,
      activeModal: prev.activeModal === modal ? 'none' : modal
    }));
  };

  const openDoctorConsultation = (doctor: Doctor) => {
    openChatWith('doctor', doctor);
  };

  const openChildProfile = (child: Child) => {
    setSelectedChild(child);
    setUiState(prev => ({ ...prev, activeModal: 'child_profile' }));
  };

  const openAddChildModal = () => {
    setSelectedChild(null);
    setUiState(prev => ({ ...prev, activeModal: 'child_profile' }));
  };

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setUiState(prev => ({ ...prev, activeModal: 'product_details' }));
  };

  const openReviewModal = (institutionId: string) => {
    setReviewTargetId(institutionId);
    setUiState(prev => ({ ...prev, activeModal: 'add_review' }));
  };

  const startBooking = (institution: Institution, service?: Service) => {
    setBookingDraft({
      institution,
      service: service || null,
      date: null,
      time: null,
      child: myChildren[0] || null
    });
    setUiState(prev => ({ ...prev, activeModal: 'booking_create' }));
  };

  const updateBookingDraft = (updates: Partial<BookingDraft>) => {
    setBookingDraft(prev => ({ ...prev, ...updates }));
  };

  const addToCart = (product: Product, quantity: number, options?: Record<string, string>) => {
    const optionStr = options ? JSON.stringify(options) : '';
    const itemId = `${product.id}-${optionStr}`;

    setCartItems(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item => item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item);
      } else {
        return [...prev, {
          id: itemId,
          productId: product.id,
          productName: product.name,
          productImage: product.images[0],
          price: product.price,
          quantity,
          selectedOptions: options
        }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const openChatList = () => {
    setUiState(prev => ({ ...prev, activeModal: 'chat_list' }));
  };

  const openChatWith = (type: 'support' | 'doctor' | 'institution', entity: any) => {
    let existingChat: ChatSession | undefined;
    
    if (type === 'support') {
      existingChat = chatSessions.find(c => c.type === 'support');
    } else if (entity) {
      existingChat = chatSessions.find(c => c.participantId === entity.id && c.type === type);
    }

    if (existingChat) {
      setActiveChatId(existingChat.id);
      setUiState(prev => ({ ...prev, activeModal: 'chat_room' }));
    } else {
      const newChat: ChatSession = {
        id: `chat_new_${Date.now()}`,
        type,
        participantId: type === 'support' ? 'support_1' : entity.id,
        participantName: type === 'support' ? 'KidSpace Support' : entity.name,
        participantAvatar: type === 'support' 
          ? 'https://img.icons8.com/fluency/96/customer-support.png' 
          : (type === 'institution' ? entity.images[0] : entity.image),
        participantRole: type === 'support' ? 'Служба поддержки' : (type === 'doctor' ? entity.specialty : 'Администратор'),
        isOnline: type === 'support' ? true : (type === 'doctor' ? entity.isOnline : false),
        unreadCount: 0,
        messages: [],
        lastMessage: '',
        lastMessageTime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };

      setChatSessions(prev => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setUiState(prev => ({ ...prev, activeModal: 'chat_room' }));
    }
  };

  const sendMessage = (chatId: string, text: string) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'me',
      text,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      type: 'text',
      isRead: true
    };

    setChatSessions(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: text,
          lastMessageTime: newMessage.timestamp
        };
      }
      return chat;
    }));

    setTimeout(() => {
      const replyMessage: ChatMessage = {
        id: `msg_r_${Date.now()}`,
        senderId: 'other',
        text: 'Спасибо за сообщение. Мы ответим вам в ближайшее время.',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        type: 'text',
        isRead: false
      };
      setChatSessions(prev => prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, replyMessage],
            lastMessage: replyMessage.text,
            lastMessageTime: replyMessage.timestamp,
            unreadCount: 0 
          };
        }
        return chat;
      }));
    }, 2000);
  };

  // --- PAYMENT LOGIC ---
  const openPayment = (config: PaymentConfig) => {
    setPaymentConfig(config);
    setUiState(prev => ({ ...prev, activeModal: 'payment' }));
  };

  const processPayment = async (method: 'wallet' | 'click' | 'payme' | 'uzum') => {
    if (!paymentConfig || !user) {
      return { success: false, message: 'Ошибка инициализации платежа' };
    }

    try {
      if (method === 'wallet') {
        if (walletBalance >= paymentConfig.amount) {
          // Deduct from wallet
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            wallet_balance: increment(-paymentConfig.amount)
          }).catch(error => handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`));
          
          // Log transaction
          await addDoc(collection(db, 'payments'), {
            user_id: user.uid,
            amount: paymentConfig.amount,
            type: 'debit',
            method: 'wallet',
            description: paymentConfig.title,
            status: 'success',
            created_at: serverTimestamp()
          }).catch(error => handleFirestoreError(error, OperationType.CREATE, 'payments'));

          return { success: true };
        } else {
          return { success: false, message: 'Недостаточно средств на кошельке' };
        }
      } else {
        // Simulate external gateway success
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Log transaction
        await addDoc(collection(db, 'payments'), {
          user_id: user.uid,
          amount: paymentConfig.amount,
          type: 'debit',
          method: method,
          description: paymentConfig.title,
          status: 'success',
          created_at: serverTimestamp()
        }).catch(error => handleFirestoreError(error, OperationType.CREATE, 'payments'));

        return { success: true };
      }
    } catch (error) {
      console.error("Payment error:", error);
      return { success: false, message: 'Произошла ошибка системы' };
    }
  };

  const checkoutCart = async (address: string) => {
    if (!user || cartItems.length === 0) return { success: false, message: 'Корзина пуста' };
    
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
      // Create order document
      await addDoc(collection(db, 'orders'), {
        user_id: user.uid,
        items: cartItems,
        total,
        address,
        status: 'processing',
        created_at: serverTimestamp()
      }).catch(error => handleFirestoreError(error, OperationType.CREATE, 'orders'));
      
      // Clear cart in local state and (optionally) Firestore
      clearCart();
      
      return { success: true };
    } catch (error) {
      console.error("Checkout error:", error);
      return { success: false, message: 'Ошибка при оформлении заказа' };
    }
  };

  const topUpWallet = async (amount: number) => {
    if (!user) return { success: false, message: 'Пользователь не авторизован' };
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        wallet_balance: increment(amount)
      }).catch(error => handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`));
      
      await addDoc(collection(db, 'payments'), {
        user_id: user.uid,
        amount,
        type: 'credit',
        method: 'external',
        description: 'Пополнение кошелька',
        status: 'success',
        created_at: serverTimestamp()
      }).catch(error => handleFirestoreError(error, OperationType.CREATE, 'payments'));
      
      return { success: true };
    } catch (error) {
      console.error("Top-up error:", error);
      return { success: false, message: 'Ошибка пополнения' };
    }
  };

  const buyPass = async (pkg: PassPackage) => {
    if (!user) return { success: false, message: 'Пользователь не авторизован' };
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(startDate.getDate() + 30);
      
      await updateDoc(userRef, {
        kidspacePass: {
          planId: pkg.id,
          planName: pkg.name,
          status: 'active',
          startDate: startDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
          balance: pkg.visits,
          totalVisits: pkg.visits,
          permissions: {
            playgrounds: true,
            masterclasses: pkg.visits > 5,
            sections: pkg.visits > 10
          }
        }
      }).catch(error => handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`));
      
      return { success: true };
    } catch (error) {
      console.error("Buy pass error:", error);
      return { success: false, message: 'Ошибка активации подписки' };
    }
  };

  const buyHealthPass = async (amount: number) => {
    if (!user) return { success: false, message: 'Пользователь не авторизован' };
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      await updateDoc(userRef, {
        healthPass: {
          isActive: true,
          planName: 'Health+ Premium',
          expiryDate: expiryDate.toISOString(),
          limit: 10,
          used: 0,
          history: userData?.healthPass?.history || []
        }
      }).catch(error => handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`));
      
      return { success: true };
    } catch (error) {
      console.error("Buy health pass error:", error);
      return { success: false, message: 'Ошибка активации Health+' };
    }
  };

  const startConsultation = async (doctor: Doctor, type: 'chat' | 'video') => {
    if (!user || !userData) return { success: false, message: 'Пользователь не авторизован' };
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const newRecord = {
        id: Math.random().toString(36).substr(2, 9),
        doctorId: doctor.id,
        doctorName: doctor.name,
        date: new Date().toISOString().split('T')[0],
        type,
        status: 'completed',
        recommendation: 'Консультация завершена успешно.'
      };
      
      const healthPass = userData.healthPass || { used: 0, limit: 0, history: [] };
      
      await updateDoc(userRef, {
        'healthPass.used': increment(1),
        'healthPass.history': [newRecord, ...(healthPass.history || [])]
      }).catch(error => handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`));
      
      return { success: true };
    } catch (error) {
      console.error("Start consultation error:", error);
      return { success: false, message: 'Ошибка при записи на консультацию' };
    }
  };

  const closeAllModals = () => {
    setUiState(prev => ({ ...prev, activeModal: 'none', isChatOpen: false }));
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      t,
      user,
      userData,
      myChildren,
      walletBalance,
      institutions,
      products,
      doctors,
      myBookings,
      login,
      logout,
      addChild,
      updateChild,
      createBooking,
      uiState,
      selectedDoctor,
      selectedChild,
      selectedProduct,
      reviewTargetId,
      bookingDraft,
      cartItems,
      chatSessions,
      activeChatId,
      paymentConfig,
      openChat,
      closeChat,
      toggleModal,
      closeAllModals,
      openDoctorConsultation,
      openChildProfile,
      openAddChildModal,
      openProductDetails,
      openReviewModal,
      startBooking,
      updateBookingDraft,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      openChatList,
      openChatWith,
      sendMessage,
      openPayment,
      processPayment,
      topUpWallet,
      buyPass,
      buyHealthPass,
      startConsultation,
      checkoutCart
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
};