

export type InstitutionType = 'Kindergarten' | 'School' | 'Course' | 'Section';

export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  deposit: number; // Prepayment required
  cancellationPolicy: string; // e.g. "Free cancel < 24h"
}

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  price: number;
  currency: string;
  address: string;
  age_range: string;
  conditions: string; 
  schedule: string;
  description: string;
  images: string[];
  location: { lat: number; lng: number };
  rating: number;
  isVerified?: boolean; // KidSafe Verified badge
  status?: 'active' | 'pending' | 'suspended';
  services?: Service[]; // Available bookable services
}

export interface Booking {
  id: string;
  institutionId: string;
  institutionName: string;
  serviceName: string;
  date: string; // ISO date YYYY-MM-DD
  time: string; // HH:mm
  childId: string;
  childName: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  price: number;
  depositPaid: number;
}

export interface Review {
  id: string;
  institutionID: string;
  userID: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  images?: string[]; // URLs to photos/videos
  date: string; 
  status?: 'published' | 'moderation' | 'rejected';
  reply?: string;
}

export type ComplaintStatus = 'New' | 'Under Review' | 'Resolved';

export interface Complaint {
  id: string;
  institutionID: string;
  userID: string;
  userName?: string;
  institutionName?: string;
  text: string;
  status: ComplaintStatus;
  priority: 'High' | 'Medium' | 'Low';
  date: string;
}

// --- Marketplace Types ---

export interface ProductOption {
  name: string; // e.g. "Color", "Size"
  values: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  images: string[]; // Changed from single image
  description: string;
  rating: number;
  options?: ProductOption[]; // Variants
  link?: string; // Legacy external link support
}

export interface CartItem {
  id: string; // unique ID for cart entry (productID + options)
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export interface Order {
  id: string;
  date: string;
  status: 'processing' | 'shipping' | 'delivered' | 'cancelled';
  total: number;
  items: CartItem[];
  deliveryAddress: string;
  paymentMethod: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string; 
  date: string;
  image: string;
  author: string;
}

// --- Chat Types ---

export interface ChatMessage {
  id: string;
  senderId: string; // 'me' or 'other'
  text: string;
  timestamp: string; // ISO or formatted time
  type: 'text' | 'image' | 'system';
  isRead: boolean;
}

export interface ChatSession {
  id: string;
  type: 'support' | 'doctor' | 'institution';
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole?: string; // e.g. "Pediatrician", "Admin"
  isOnline: boolean;
  unreadCount: number;
  messages: ChatMessage[];
  lastMessage?: string;
  lastMessageTime?: string;
}

// --- Enhanced User Profile Types (Kidspace 5.0) ---

export interface UserRegion {
  city: string;
  district: string;
  coordinates?: { lat: number; lng: number };
}

export interface UserStats {
  activityScore: number; // Gamification 0-1000
  placesVisitedMonth: number;
  reviewsCount: number;
  registrationDate: string;
  lastLogin: string;
}

export interface PassPackage {
  id: string;
  name: string;
  visits: number;
  price: number;
  description: string;
  color: string; // Tailwind gradient classes
  popular?: boolean;
}

export interface KidspacePassData {
  planId: string;
  planName: string;
  status: 'active' | 'expired' | 'trial';
  startDate: string;
  expiryDate: string;
  balance: number; // Remaining visits
  totalVisits: number; // Initial visits capacity
  permissions: {
    playgrounds: boolean;
    masterclasses: boolean;
    sections: boolean;
  };
  paymentMethod?: string; // e.g. "Uzcard *8899"
  autoRenew?: boolean;
}

export interface ConsultationRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  type: 'chat' | 'video';
  status: 'completed' | 'cancelled';
  recommendation?: string; // Medical notes
}

export interface HealthPassData {
  isActive: boolean;
  planName: string;
  expiryDate?: string;
  doctorId?: string; // Assigned pediatrician
  lastConsultation?: string;
  limit: number; // Total consultations allowed
  used: number; // Consultations used
  history: ConsultationRecord[];
}

// --- Detailed Child Profile ---

export interface ChildActivity {
  id: string;
  title: string;
  location: string;
  date: string;
  type: 'education' | 'leisure' | 'health';
  status: 'attended' | 'missed' | 'upcoming';
}

export interface Child {
  id: string;
  name: string;
  birthDate: string; // ISO Date for accurate age calc
  age: number; // Calculated helper
  gender: 'boy' | 'girl';
  image?: string;
  
  // Education
  education?: {
    institutionId: string;
    name: string;
    type: 'Kindergarten' | 'School';
  };
  
  // Personal
  interests: string[]; // e.g., "Robotics", "Swimming"
  favoritePlaces: { id: string; name: string; category: string }[];
  
  // Stats & History
  activityLevel: number; // %
  activityHistory: ChildActivity[];
  stats: {
    attendanceRate: number; // %
    monthlyVisits: number[]; // Array of visit counts [Jan, Feb...]
  };
}

export interface NotificationPreferences {
  passExpiry: boolean;
  newEvents: boolean;
  recommendations: boolean;
  news: boolean;
  vaccinationReminders: boolean;
}

export interface UserAction {
  id: string;
  type: 'login' | 'booking' | 'review' | 'payment' | 'update';
  description: string;
  date: string;
}

export interface User {
  id: string;
  uid: string; // Firebase Auth ID
  name: string;
  email: string;
  phone: string;
  role: 'parent' | 'institution' | 'admin' | 'doctor' | 'partner';
  avatar: string;
  
  // Geolocation
  region: UserRegion;
  
  // Balances & Subscriptions
  walletBalance: number; // In UZS
  kidspacePass: KidspacePassData | null;
  healthPass: HealthPassData;
  
  // Family
  children: Child[];
  
  // Analytics & Stats
  stats: UserStats;
  history: UserAction[];
  bookings: Booking[];
  cart: CartItem[]; // Shopping cart
  orders: Order[]; // Purchase history
  chats: ChatSession[]; // Active conversations
  
  status: 'active' | 'banned';
  
  // Preferences
  notificationsEnabled: boolean;
  notificationPreferences: NotificationPreferences;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'alert';
}

// --- New Types for KidSpace 5.0 Services ---

export interface Doctor {
  id: string;
  name: string;
  specialty: string; 
  experience: number; // years
  rating: number;
  image: string;
  isOnline: boolean;
  price: number; // Consultation price
}

export interface Activity {
  id: string;
  name: string;
  category: string; 
  location: string;
  image: string;
  discount: string; 
  includedInPass: boolean;
}

export interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  date: string;
  topic: string; 
}

// --- Admin Types ---

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'Subscription' | 'Marketplace' | 'Consultation';
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalRevenue: number;
  activeInstitutions: number;
  pendingComplaints: number;
  dailyActiveUsers: number[]; // Array for chart
  revenueData: number[]; // Array for chart
}