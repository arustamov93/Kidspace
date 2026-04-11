import { Institution, Product, BlogPost, Review, User, Doctor, Activity, ForumPost, Transaction, AdminAnalytics, Complaint, Notification, PassPackage } from './types';

// --- NEW PASS PACKAGES ---
export const PASS_PACKAGES: PassPackage[] = [
  { id: 'pack_6', name: 'Start', visits: 6, price: 300000, description: 'Идеально для выходных', color: 'from-blue-400 to-blue-600' },
  { id: 'pack_8', name: 'Basic', visits: 8, price: 380000, description: 'Популярный выбор', color: 'from-green-400 to-green-600' },
  { id: 'pack_10', name: 'Active', visits: 10, price: 450000, description: 'Выгодная цена', color: 'from-purple-400 to-purple-600', popular: true },
  { id: 'pack_12', name: 'Super', visits: 12, price: 520000, description: 'Больше впечатлений', color: 'from-orange-400 to-orange-600' },
  { id: 'pack_20', name: 'Max', visits: 20, price: 800000, description: 'Максимальная выгода', color: 'from-red-400 to-red-600' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Эргономичный Рюкзак "Космос"',
    category: 'Школьные товары',
    price: 500000,
    currency: 'UZS',
    images: ['https://picsum.photos/id/160/600/600', 'https://picsum.photos/id/161/600/600'],
    description: 'Легкий и прочный рюкзак с ортопедической спинкой. Идеален для начальной школы. Светоотражающие элементы для безопасности.',
    rating: 4.8,
    options: [
       { name: 'Цвет', values: ['Синий', 'Черный'] }
    ]
  },
  {
    id: 'prod_2',
    name: 'Набор Монтессори "Учимся считать"',
    category: 'Игрушки',
    price: 350000,
    currency: 'UZS',
    images: ['https://picsum.photos/id/130/600/600'],
    description: 'Деревянный набор для развития мелкой моторики и счета. Экологичные материалы, безопасно для детей от 3 лет.',
    rating: 4.9
  },
  {
    id: 'prod_3',
    name: 'Детские GPS Часы 4G',
    category: 'Электроника',
    price: 700000,
    currency: 'UZS',
    images: ['https://picsum.photos/id/250/600/600'],
    description: 'Всегда знайте, где ваш ребенок. Видеозвонки, кнопка SOS, геозоны. Водонепроницаемый корпус.',
    rating: 4.5,
    options: [
       { name: 'Цвет', values: ['Розовый', 'Голубой', 'Желтый'] }
    ]
  },
  {
    id: 'prod_4',
    name: 'Набор для рисования (150 предметов)',
    category: 'Творчество',
    price: 150000,
    currency: 'UZS',
    images: ['https://picsum.photos/id/104/600/600'],
    description: 'Большой чемоданчик юного художника. Фломастеры, карандаши, мелки и акварель.',
    rating: 4.7
  },
  {
    id: 'prod_5',
    name: 'Детский велосипед SpeedRacer',
    category: 'Спорт',
    price: 1200000,
    currency: 'UZS',
    images: ['https://picsum.photos/id/146/600/600'],
    description: 'Надежный стальной велосипед с дополнительными колесами. Регулируемое сиденье и руль.',
    rating: 4.6,
    options: [
       { name: 'Диаметр колес', values: ['14"', '16"', '20"'] },
       { name: 'Цвет', values: ['Красный', 'Зеленый'] }
    ]
  },
  {
    id: 'prod_6',
    name: 'Сказки народов мира',
    category: 'Книги',
    price: 45000,
    currency: 'UZS',
    images: ['https://picsum.photos/id/24/600/600'],
    description: 'Красочная книга с лучшими сказками. Крупный шрифт, плотная бумага.',
    rating: 5.0
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'doc_user_1',
    uid: 'firebase_uid_123',
    name: 'Akmal Abdullaev',
    email: 'akmal@gmail.com',
    phone: '+998901112233',
    role: 'parent',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    
    region: {
      city: 'Tashkent',
      district: 'Yunusabad',
      coordinates: { lat: 41.3645, lng: 69.2918 }
    },

    walletBalance: 125000,
    cart: [],
    orders: [
       {
          id: 'ord_883',
          date: '2023-11-15',
          status: 'delivered',
          total: 350000,
          deliveryAddress: 'ул. Амира Темура, 10, кв 5',
          paymentMethod: 'Click',
          items: [
             { id: 'ci_1', productId: 'prod_2', productName: 'Набор Монтессори', productImage: 'https://picsum.photos/id/130/100/100', price: 350000, quantity: 1 }
          ]
       }
    ],
    
    kidspacePass: {
      planId: 'pack_12',
      planName: 'Super',
      status: 'active',
      startDate: '2025-11-01',
      expiryDate: '2025-12-01',
      balance: 12, // 12 visits remaining
      totalVisits: 12,
      permissions: {
        playgrounds: true,
        masterclasses: true,
        sections: false
      },
      paymentMethod: 'Uzcard •••• 8899',
      autoRenew: true
    },

    healthPass: {
      isActive: true,
      planName: 'Health+ Family',
      expiryDate: '2026-05-01',
      doctorId: 'doc_1',
      lastConsultation: '2025-11-28',
      limit: 10,
      used: 2,
      history: [
        { 
          id: 'cons_1', 
          doctorId: 'doc_1', 
          doctorName: 'Др. Алишер Т.', 
          date: '2025-11-28', 
          type: 'video', 
          status: 'completed', 
          recommendation: 'Принимать витамин D3 по 1000 МЕ утром. Обильное питье.' 
        },
        { 
          id: 'cons_2', 
          doctorId: 'doc_3', 
          doctorName: 'Др. Рустам З.', 
          date: '2025-10-15', 
          type: 'chat', 
          status: 'completed', 
          recommendation: 'Исключить цитрусовые на 2 недели. Наблюдать за кожной реакцией.' 
        }
      ]
    },

    stats: {
      activityScore: 820,
      placesVisitedMonth: 5,
      reviewsCount: 12,
      registrationDate: '2025-11-28T12:00:00Z',
      lastLogin: '2025-11-29T21:00:00Z'
    },

    history: [
      { id: 'act_1', type: 'login', description: 'Вход в систему', date: '2025-11-29 21:00' },
      { id: 'act_2', type: 'booking', description: 'Запись к врачу (Др. Алишер)', date: '2025-11-28 14:30' },
      { id: 'act_3', type: 'payment', description: 'Оплата подписки (500,000 UZS)', date: '2025-11-01 09:15' },
      { id: 'act_4', type: 'payment', description: 'Пополнение кошелька (125,000 UZS)', date: '2025-10-25 09:15' },
      { id: 'act_5', type: 'review', description: 'Отзыв о садике "Солнышко"', date: '2025-10-20 18:45' },
      { id: 'act_6', type: 'booking', description: 'Посещение Galaxy Kids', date: '2025-10-18 11:00' }
    ],
    
    bookings: [
      { 
        id: 'bk_1', 
        institutionId: 'inst_3', 
        institutionName: 'RoboKids', 
        serviceName: 'Пробный урок', 
        date: '2025-12-05', 
        time: '14:00', 
        childId: 'c1', 
        childName: 'Ali', 
        status: 'confirmed', 
        price: 50000, 
        depositPaid: 50000 
      },
      { 
        id: 'bk_2', 
        institutionId: 'doc_1', 
        institutionName: 'Др. Алишер Т.', 
        serviceName: 'Онлайн консультация', 
        date: '2025-12-02', 
        time: '10:30', 
        childId: 'c2', 
        childName: 'Laylo', 
        status: 'confirmed', 
        price: 150000, 
        depositPaid: 150000 
      }
    ],

    chats: [
      {
        id: 'chat_support',
        type: 'support',
        participantId: 'support_1',
        participantName: 'KidSpace Support',
        participantAvatar: 'https://img.icons8.com/fluency/96/customer-support.png',
        participantRole: 'Служба поддержки',
        isOnline: true,
        unreadCount: 1,
        lastMessage: 'Чем могу помочь?',
        lastMessageTime: '10:30',
        messages: [
           { id: 'm1', senderId: 'other', text: 'Здравствуйте! Добро пожаловать в KidSpace.', timestamp: '10:00', type: 'text', isRead: true },
           { id: 'm2', senderId: 'other', text: 'Чем могу помочь?', timestamp: '10:30', type: 'text', isRead: false }
        ]
      },
      {
        id: 'chat_doc_1',
        type: 'doctor',
        participantId: 'doc_1',
        participantName: 'Др. Алишер Т.',
        participantAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        participantRole: 'Педиатр',
        isOnline: true,
        unreadCount: 0,
        lastMessage: 'Принимайте витамины по расписанию.',
        lastMessageTime: 'Вчера',
        messages: [
           { id: 'm3', senderId: 'me', text: 'Добрый день, доктор. Кашель стал меньше.', timestamp: 'Вчера 14:00', type: 'text', isRead: true },
           { id: 'm4', senderId: 'other', text: 'Отлично! Принимайте витамины по расписанию.', timestamp: 'Вчера 14:15', type: 'text', isRead: true }
        ]
      }
    ],

    status: 'active',
    notificationsEnabled: true,
    notificationPreferences: {
      passExpiry: true,
      newEvents: true,
      recommendations: true,
      news: true,
      vaccinationReminders: true
    },

    children: [
      {
        id: 'c1',
        name: 'Ali',
        birthDate: '2017-05-20',
        age: 6,
        gender: 'boy',
        image: 'https://img.icons8.com/fluency/96/boy.png',
        interests: ['Робототехника', 'Футбол', 'Лего'],
        education: {
          institutionId: 'inst_1',
          name: 'Садик "Солнышко"',
          type: 'Kindergarten'
        },
        favoritePlaces: [
           { id: 'fp1', name: 'Galaxy Kids', category: 'Развлечения' },
           { id: 'fp2', name: 'Парк Magic City', category: 'Парк' }
        ],
        activityLevel: 75,
        activityHistory: [
           { id: 'ca1', title: 'Урок Футбола', location: 'Спорткомплекс Юнусабад', date: 'Вчера, 16:00', type: 'leisure', status: 'attended' },
           { id: 'ca2', title: 'Детский сад', location: 'Солнышко', date: 'Сегодня, 08:30', type: 'education', status: 'attended' },
           { id: 'ca3', title: 'Вакцинация', location: 'Поликлиника №5', date: 'Завтра, 10:00', type: 'health', status: 'upcoming' }
        ],
        stats: {
           attendanceRate: 92,
           monthlyVisits: [12, 15, 10, 18, 20, 22] // Jun-Nov
        }
      },
      {
        id: 'c2',
        name: 'Laylo',
        birthDate: '2014-08-10',
        age: 9,
        gender: 'girl',
        image: 'https://img.icons8.com/fluency/96/girl.png',
        interests: ['Рисование', 'Танцы', 'Чтение'],
        education: {
          institutionId: 'inst_2',
          name: 'Школа "Лидеры"',
          type: 'School'
        },
        favoritePlaces: [
           { id: 'fp3', name: 'Музей Искусств', category: 'Культура' },
           { id: 'fp4', name: 'Bon Bon Cafe', category: 'Еда' }
        ],
        activityLevel: 90,
        activityHistory: [
           { id: 'ca4', title: 'Урок Танцев', location: 'Студия "Грация"', date: 'Вчера, 14:00', type: 'leisure', status: 'attended' },
           { id: 'ca5', title: 'Школа', location: 'Лидеры Будущего', date: 'Сегодня, 08:00', type: 'education', status: 'attended' },
        ],
        stats: {
           attendanceRate: 98,
           monthlyVisits: [20, 22, 18, 24, 25, 23] // Jun-Nov
        }
      }
    ]
  },
  {
    id: 'doc_user_2',
    uid: 'firebase_uid_admin',
    name: 'Администратор',
    email: 'admin@kidspace.com',
    phone: '+998 90 000 00 00',
    role: 'admin',
    avatar: 'https://img.icons8.com/fluency/96/system-administrator-male.png',
    region: { city: 'Tashkent', district: 'Center' },
    walletBalance: 0,
    kidspacePass: null,
    healthPass: { isActive: false, planName: '', limit: 0, used: 0, history: [] },
    stats: { activityScore: 0, placesVisitedMonth: 0, reviewsCount: 0, registrationDate: '2022-11-01', lastLogin: '2023-11-29' },
    history: [],
    bookings: [],
    cart: [],
    orders: [],
    chats: [],
    status: 'active',
    notificationsEnabled: false,
    notificationPreferences: {
      passExpiry: false,
      newEvents: false,
      recommendations: false,
      news: false,
      vaccinationReminders: false
    },
    children: []
  },
  {
    id: 'doc_user_3',
    uid: 'firebase_uid_partner',
    name: 'Директор Школы',
    email: 'contact@futureleaders.uz',
    phone: '+998 90 999 88 77',
    role: 'institution',
    avatar: 'https://img.icons8.com/fluency/96/business-building.png',
    region: { city: 'Tashkent', district: 'Mirzo-Ulugbek' },
    walletBalance: 0,
    kidspacePass: null,
    healthPass: { isActive: false, planName: '', limit: 0, used: 0, history: [] },
    stats: { activityScore: 0, placesVisitedMonth: 0, reviewsCount: 0, registrationDate: '2023-03-10', lastLogin: '2023-11-29' },
    history: [],
    bookings: [],
    cart: [],
    orders: [],
    chats: [],
    status: 'active',
    notificationsEnabled: true,
    notificationPreferences: {
      passExpiry: true,
      newEvents: true,
      recommendations: false,
      news: true,
      vaccinationReminders: false
    },
    children: []
  }
];

export const MOCK_INSTITUTIONS: Institution[] = [
  {
    id: 'inst_1',
    name: 'Детский сад "Солнышко"',
    type: 'Kindergarten',
    price: 4500000,
    currency: 'UZS',
    address: 'ул. Солнечная 123, Ташкент',
    age_range: '2-6 лет',
    conditions: '5-разовое питание, Английский язык, охрана',
    schedule: 'Пн-Пт 08:00 - 18:00',
    description: 'Заботливая среда для ваших малышей с акцентом на творческое развитие.',
    images: ['https://picsum.photos/id/10/800/600', 'https://picsum.photos/id/11/800/600'],
    location: { lat: 41.2995, lng: 69.2401 },
    rating: 4.8,
    isVerified: true,
    status: 'active',
    services: [
      { id: 'srv_1', name: 'Экскурсия (Знакомство)', duration: 45, price: 0, deposit: 0, cancellationPolicy: 'Бесплатная отмена' },
      { id: 'srv_2', name: 'Адаптационная неделя', duration: 0, price: 500000, deposit: 100000, cancellationPolicy: 'Отмена за 48ч' }
    ]
  },
  {
    id: 'inst_kg_1',
    name: 'Galaktika & Hello Kids',
    type: 'Kindergarten',
    price: 5500000,
    currency: 'UZS',
    address: 'Яккасарайский р-н, ул. Юсуф Хос Ходжиб 1-й пр., 17',
    age_range: '2-7 лет',
    conditions: 'Языковой уклон, хореография, логопед',
    schedule: '08:00 - 18:30',
    description: 'Современный детский сад с индивидуальным подходом к каждому ребенку. Телефон: +998-90-063-69-00',
    images: ['https://picsum.photos/id/50/800/600'],
    location: { lat: 41.2750, lng: 69.2480 },
    rating: 4.7,
    isVerified: true,
    status: 'active'
  },
  {
    id: 'inst_kg_2',
    name: 'Unikland Cambridge Junior',
    type: 'Kindergarten',
    price: 7200000,
    currency: 'UZS',
    address: 'Мирзо-Улугбекский р-н, ул. Буюк Ипак Йули, 232-234',
    age_range: '3-7 лет',
    conditions: 'Кембриджская программа, носители языка, бассейн',
    schedule: '08:30 - 17:30',
    description: 'Премиальное дошкольное образование по международным стандартам. Телефон: +998-93-175-11-11',
    images: ['https://picsum.photos/id/51/800/600'],
    location: { lat: 41.3320, lng: 69.3350 },
    rating: 4.9,
    isVerified: true,
    status: 'active'
  },
  {
    id: 'inst_kg_3',
    name: 'Kindergarten Azzar',
    type: 'Kindergarten',
    price: 4800000,
    currency: 'UZS',
    address: 'Мирабадский р-н, ул. Чиноз, дом 8',
    age_range: '2-6 лет',
    conditions: 'Здоровое питание, подготовка к школе, видеонаблюдение',
    schedule: '08:00 - 19:00',
    description: 'Уютная атмосфера и заботливые воспитатели. Телефон: +998-93-991-10-10',
    images: ['https://picsum.photos/id/52/800/600'],
    location: { lat: 41.2950, lng: 69.2740 },
    rating: 4.5,
    status: 'active'
  },
  {
    id: 'inst_kg_4',
    name: 'SMART SCHOOL Kindergarten',
    type: 'Kindergarten',
    price: 6000000,
    currency: 'UZS',
    address: 'Чиланзарский р-н, ул. Чиланзар, 6 (ориентир «Узбекфильм»)',
    age_range: '3-7 лет',
    conditions: 'Интеллектуальное развитие, шахматы, ментальная арифметика',
    schedule: '08:00 - 18:00',
    description: 'Развиваем умственные способности с ранних лет. Телефон: +998-90-827-31-31',
    images: ['https://picsum.photos/id/53/800/600'],
    location: { lat: 41.2820, lng: 69.2050 },
    rating: 4.6,
    isVerified: true,
    status: 'active'
  },
  {
    id: 'inst_kg_5',
    name: 'Invento International School',
    type: 'Kindergarten',
    price: 12000000,
    currency: 'UZS',
    address: 'Шайхантахурский р-н, ул. Фурката, 4А (Tashkent City)',
    age_range: '2-7 лет',
    conditions: 'IB программа, Кампус мирового уровня, Экологичное питание',
    schedule: '08:00 - 18:00',
    description: 'Международный детский сад в сердце Tashkent City. Телефон: +998-71-210-99-99',
    images: ['https://picsum.photos/id/54/800/600'],
    location: { lat: 41.3130, lng: 69.2450 },
    rating: 5.0,
    isVerified: true,
    status: 'active'
  },
  {
    id: 'inst_kg_6',
    name: 'UNITED KIDS',
    type: 'Kindergarten',
    price: 5000000,
    currency: 'UZS',
    address: 'Яккасарайский р-н, ул. Кичик Бешагач, 45',
    age_range: '2-6 лет',
    conditions: 'Творческие студии, спортивные секции, психолог',
    schedule: '08:00 - 18:00',
    description: 'Дружная семья для вашего ребенка. Телефон: +998-77-064-14-41',
    images: ['https://picsum.photos/id/55/800/600'],
    location: { lat: 41.2780, lng: 69.2550 },
    rating: 4.4,
    status: 'active'
  },
  {
    id: 'inst_kg_7',
    name: 'KIDS LAND',
    type: 'Kindergarten',
    price: 4200000,
    currency: 'UZS',
    address: 'Яккасарайский р-н, ул. Беш Чинор, д. 8',
    age_range: '1.5-6 лет',
    conditions: 'Ясельные группы, соляная комната, массаж',
    schedule: '07:30 - 18:30',
    description: 'Здоровьесберегающие технологии и уют. Телефон: +998-94-646-62-26',
    images: ['https://picsum.photos/id/56/800/600'],
    location: { lat: 41.2850, lng: 69.2600 },
    rating: 4.3,
    status: 'active'
  },
  {
    id: 'inst_kg_8',
    name: 'Magic World',
    type: 'Kindergarten',
    price: 5800000,
    currency: 'UZS',
    address: 'ул. Буюк Ипак Йули, 302',
    age_range: '2-7 лет',
    conditions: 'Сказочный интерьер, Lego-конструирование, английский',
    schedule: '08:00 - 19:00',
    description: 'Волшебный мир знаний для детей. Телефон: +998-99-922-57-57',
    images: ['https://picsum.photos/id/57/800/600'],
    location: { lat: 41.3400, lng: 69.3500 },
    rating: 4.8,
    isVerified: true,
    status: 'active'
  },
  {
    id: 'inst_kg_9',
    name: 'Abc World',
    type: 'Kindergarten',
    price: 4600000,
    currency: 'UZS',
    address: 'Яккасарайский р-н, Богтепа 4-й проезд, 4',
    age_range: '2-6 лет',
    conditions: 'Изучение алфавита, подготовка к школе, музыка',
    schedule: '08:00 - 18:00',
    description: 'Ваш первый шаг в мир образования.',
    images: ['https://picsum.photos/id/58/800/600'],
    location: { lat: 41.2720, lng: 69.2450 },
    rating: 4.5,
    status: 'active'
  },
  {
    id: 'inst_kg_10',
    name: 'Aist',
    type: 'Kindergarten',
    price: 5200000,
    currency: 'UZS',
    address: 'Мирзо-Улугбекский р-н, ул. Аккурган, 7',
    age_range: '2-7 лет',
    conditions: 'Зеленая территория, экологичное питание, спорт',
    schedule: '08:00 - 18:00',
    description: 'Сад "Аист" - традиции воспитания и современные методики.',
    images: ['https://picsum.photos/id/59/800/600'],
    location: { lat: 41.3250, lng: 69.3000 },
    rating: 4.6,
    status: 'active'
  },
  {
    id: 'inst_sch_1',
    name: 'Oxbridge International School',
    type: 'School',
    price: 9500000,
    currency: 'UZS',
    address: 'Мирзо-Улугбекский р-н, ул. Ойбек, 12',
    age_range: '6-18 лет',
    conditions: 'IB Программа, Узбекский аттестат, Питание',
    schedule: '08:30 - 17:00',
    description: 'Один из крупнейших частных школ — с программами IB и узбекской; кампусы в Мирзо-Улугбекском и Яшнабадском районах.',
    images: ['https://picsum.photos/id/201/800/600'],
    location: { lat: 41.2950, lng: 69.2850 },
    rating: 4.8,
    isVerified: true,
    status: 'active'
  },
  {
    id: 'inst_sch_2',
    name: 'The British School of Tashkent',
    type: 'School',
    price: 18500000,
    currency: 'UZS',
    address: 'Мирзо-Улугбекский р-н, ул. Каландар, 3',
    age_range: '3-18 лет',
    conditions: 'Британская программа, IGCSE, A-Level',
    schedule: '08:00 - 16:00',
    description: 'Часть семьи Nord Anglia Education. Английская программа + возможность двойного аттестата (узбекского и IGCSE).',
    images: ['https://picsum.photos/id/202/800/600'],
    location: { lat: 41.3450, lng: 69.3550 },
    rating: 5.0,
    isVerified: true,
    status: 'active'
  },
  {
    id: 'inst_sch_3',
    name: 'Profi School',
    type: 'School',
    price: 4500000,
    currency: 'UZS',
    address: 'Яккасарайский р-н, ул. Шота Руставели, 55',
    age_range: '6-17 лет',
    conditions: 'Индивидуальный подход, IT классы',
    schedule: '08:30 - 17:30',
    description: 'Частная школа с индивидуальным подходом, рассчитана на 1–11 классы.',
    images: ['https://picsum.photos/id/203/800/600'],
    location: { lat: 41.2850, lng: 69.2550 },
    rating: 4.5,
    status: 'active'
  },
  {
    id: 'inst_sch_4',
    name: 'Smart School',
    type: 'School',
    price: 6000000,
    currency: 'UZS',
    address: 'Чиланзарский р-н, ул. Чиланзар, 6',
    age_range: '6-17 лет',
    conditions: 'Cambridge Program, IBDP',
    schedule: '08:00 - 18:00',
    description: 'Частная школа (и школа-сад) с Cambridge / IBDP программами. Развитая инфраструктура.',
    images: ['https://picsum.photos/id/204/800/600'],
    location: { lat: 41.2820, lng: 69.2050 },
    rating: 4.7,
    isVerified: true,
    status: 'active'
  },
  {
    id: 'inst_sch_5',
    name: 'Erudite Education',
    type: 'School',
    price: 4200000,
    currency: 'UZS',
    address: 'Алмазарский р-н, ул. Беруни, 3',
    age_range: '6-17 лет',
    conditions: 'Углубленная математика, Английский',
    schedule: '08:00 - 18:00',
    description: 'Частная школа с углублённым изучением математики и английского языка.',
    images: ['https://picsum.photos/id/205/800/600'],
    location: { lat: 41.3350, lng: 69.2150 },
    rating: 4.4,
    status: 'active'
  },
  {
    id: 'inst_sch_6',
    name: 'Artel Technical School',
    type: 'School',
    price: 5000000,
    currency: 'UZS',
    address: 'Чиланзарский р-н, ориентир Artel',
    age_range: '10-17 лет',
    conditions: 'Технический уклон, Робототехника, Физика',
    schedule: '08:30 - 17:00',
    description: 'Частная школа с упором на техническое и профильное образование при поддержке Artel.',
    images: ['https://picsum.photos/id/206/800/600'],
    location: { lat: 41.2750, lng: 69.2150 },
    rating: 4.6,
    status: 'active'
  },
  {
    id: 'inst_sch_7',
    name: 'Global Elite School',
    type: 'School',
    price: 7500000,
    currency: 'UZS',
    address: 'Мирабадский р-н',
    age_range: '6-17 лет',
    conditions: 'Иностранные языки, Международный обмен',
    schedule: '08:30 - 17:30',
    description: 'Частная школа, специализирующаяся на иностранных языках и международных программах.',
    images: ['https://picsum.photos/id/207/800/600'],
    location: { lat: 41.2950, lng: 69.2650 },
    rating: 4.8,
    isVerified: true,
    status: 'active'
  },
  {
    id: 'inst_sch_8',
    name: 'INVENTO The Uzbek International School',
    type: 'School',
    price: 13000000,
    currency: 'UZS',
    address: 'Шайхантахурский р-н, ул. Фурката, 4А (Tashkent City)',
    age_range: '6-18 лет',
    conditions: 'IB Continuum, Современный кампус, Бассейн',
    schedule: '08:00 - 18:00',
    description: 'Международная школа в центре Tashkent City. Программы IB PYP, MYP, DP.',
    images: ['https://picsum.photos/id/208/800/600'],
    location: { lat: 41.3130, lng: 69.2450 },
    rating: 5.0,
    isVerified: true,
    status: 'active'
  },
  {
    id: 'inst_2',
    name: 'Школа "Лидеры Будущего"',
    type: 'School',
    price: 9000000,
    currency: 'UZS',
    address: 'ул. Знаний 45, Ташкент',
    age_range: '6-17 лет',
    conditions: 'Кембриджская программа, STEM лаборатория, Бассейн',
    schedule: 'Пн-Пт 08:30 - 16:30',
    description: 'Готовим следующее поколение лидеров через академические успехи и спорт.',
    images: ['https://picsum.photos/id/20/800/600', 'https://picsum.photos/id/22/800/600'],
    location: { lat: 41.3111, lng: 69.2797 },
    rating: 4.5,
    isVerified: true,
    status: 'active',
    services: [
      { id: 'srv_3', name: 'Вступительное тестирование', duration: 120, price: 150000, deposit: 150000, cancellationPolicy: 'Невозвратный' },
      { id: 'srv_4', name: 'День открытых дверей', duration: 180, price: 0, deposit: 0, cancellationPolicy: 'Бесплатная отмена' }
    ]
  },
  {
    id: 'inst_3',
    name: 'Клуб Робототехники RoboKids',
    type: 'Course',
    price: 1200000,
    currency: 'UZS',
    address: 'Технопарк, офис 88, Ташкент',
    age_range: '8-14 лет',
    conditions: 'Ноутбуки предоставляются, малые группы',
    schedule: 'Сб-Вс 10:00 - 12:00',
    description: 'Изучаем Python и робототехнику в веселой игровой форме.',
    images: ['https://picsum.photos/id/3/800/600'],
    location: { lat: 41.3200, lng: 69.2500 },
    rating: 4.9,
    status: 'active',
    isVerified: false,
    services: [
      { id: 'srv_5', name: 'Пробный урок', duration: 60, price: 50000, deposit: 50000, cancellationPolicy: 'Отмена за 12ч' },
      { id: 'srv_6', name: 'Абонемент (12 занятий)', duration: 0, price: 1200000, deposit: 300000, cancellationPolicy: 'Отмена за 24ч' }
    ]
  },
  {
    id: 'inst_4',
    name: 'Секция Плавания "Дельфинчик"',
    type: 'Section',
    price: 800000,
    currency: 'UZS',
    address: 'Аква Центр, д. 12',
    age_range: '4-12 лет',
    conditions: 'Теплый бассейн, профессиональные тренеры',
    schedule: 'Вт/Чт 16:00 - 17:30',
    description: 'Профессиональные уроки плавания для начинающих и продвинутых.',
    images: ['https://picsum.photos/id/45/800/600'],
    location: { lat: 41.3000, lng: 69.2100 },
    rating: 4.7,
    isVerified: true,
    status: 'active',
    services: [
       { id: 'srv_7', name: 'Разовое посещение', duration: 90, price: 80000, deposit: 40000, cancellationPolicy: 'Отмена за 4ч' }
    ]
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    institutionID: 'inst_1',
    userID: 'u_101',
    userName: 'Malika K.',
    rating: 5,
    text: 'Прекрасный садик! Воспитатели очень внимательные.',
    date: '2023-11-20',
    status: 'published'
  },
  {
    id: 'rev_2',
    institutionID: 'inst_1',
    userID: 'u_102',
    userName: 'Timur S.',
    rating: 4,
    text: 'Хорошо, но дороговато.',
    date: '2023-10-15',
    status: 'published'
  },
    {
    id: 'rev_3',
    institutionID: 'inst_2',
    userID: 'u_103',
    userName: 'Aziza',
    rating: 5,
    text: 'Школа супер, ребенок доволен.',
    date: '2023-11-25',
    status: 'moderation'
  }
];

export const MOCK_DOCTORS: Doctor[] = [
    {
        id: 'doc_1',
        name: 'Dr. Alisher T.',
        specialty: 'Pediatrician',
        experience: 10,
        rating: 4.9,
        image: 'https://randomuser.me/api/portraits/men/32.jpg',
        isOnline: true,
        price: 150000
    },
    {
        id: 'doc_2',
        name: 'Dr. Feruza M.',
        specialty: 'Neurologist',
        experience: 15,
        rating: 4.8,
        image: 'https://randomuser.me/api/portraits/women/44.jpg',
        isOnline: false,
        price: 200000
    },
    {
        id: 'doc_3',
        name: 'Dr. Rustam Z.',
        specialty: 'Allergist',
        experience: 8,
        rating: 4.7,
        image: 'https://randomuser.me/api/portraits/men/64.jpg',
        isOnline: true,
        price: 180000
    }
];

export const MOCK_ACTIVITIES: Activity[] = [
    {
        id: 'act_1',
        name: 'Magic City Park',
        category: 'Park',
        location: 'Tashkent',
        image: 'https://picsum.photos/id/10/200/200',
        discount: '10%',
        includedInPass: true
    },
     {
        id: 'act_2',
        name: 'Tashkent Zoo',
        category: 'Zoo',
        location: 'Tashkent',
        image: 'https://picsum.photos/id/12/200/200',
        discount: 'Free Entry',
        includedInPass: true
    }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', userId: 'u_1', userName: 'Akmal', amount: -50000, type: 'Subscription', status: 'Completed', date: '2023-11-20' },
  { id: 'tx_2', userId: 'u_1', userName: 'Akmal', amount: 150000, type: 'Consultation', status: 'Completed', date: '2023-11-15' },
  { id: 'tx_3', userId: 'u_1', userName: 'Akmal', amount: -350000, type: 'Marketplace', status: 'Completed', date: '2023-11-10' },
  { id: 'tx_4', userId: 'u_2', userName: 'User 2', amount: 500000, type: 'Subscription', status: 'Completed', date: '2023-11-22' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'n_1', title: 'Оплата прошла', message: 'Ваш платеж за садик успешно обработан.', time: '10:30', read: false, type: 'success' },
    { id: 'n_2', title: 'Новое сообщение', message: 'Врач ответил на ваш вопрос.', time: '09:15', read: true, type: 'info' }
];

export const ADMIN_STATS: AdminAnalytics = {
    totalUsers: 15420,
    totalRevenue: 450000000,
    activeInstitutions: 120,
    pendingComplaints: 5,
    dailyActiveUsers: [1200, 1350, 1100, 1400, 1500, 1600, 1550],
    revenueData: [30000000, 45000000, 28000000, 52000000, 48000000, 60000000, 55000000]
};

export const MOCK_COMPLAINTS: Complaint[] = [
    { id: 'c_1', institutionID: 'inst_1', userID: 'u_5', institutionName: 'Детский сад "Солнышко"', text: 'Грязно в столовой', status: 'New', priority: 'Medium', date: '2023-11-28' },
    { id: 'c_2', institutionID: 'inst_3', userID: 'u_8', institutionName: 'RoboKids', text: 'Учитель опоздал на 30 мин', status: 'Under Review', priority: 'Low', date: '2023-11-27' }
];