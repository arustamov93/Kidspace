import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Layouts & Components
import { BottomNav } from './components/Layout';
import { AIAssistant, ScanModal, BookingsModal, WalletModal, NotificationsModal, DoctorConsultationModal, AddReviewModal, BookingCreationModal, ChildProfileModal, ProductDetailsModal, CartModal, ChatListModal, ChatRoomModal, PaymentModal } from './components/Overlays';

// Pages
import { HomePage } from './pages/Home';
import { FamilyPassPage } from './pages/Pass';
import { HealthPage } from './pages/Health';
import { ProfilePage } from './pages/Profile';
import { CatalogPage, InstitutionPage, ManageInstitutionPage } from './pages/Directory';
import { MarketPage } from './pages/Market';
import { AdminPage } from './pages/Admin';

const AppLayout = () => {
  const { uiState } = useAppContext();
  
  return (
    <>
      <div className="bg-gray-50 min-h-screen text-slate-800 font-sans">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog/:type" element={<CatalogPage />} />
          <Route path="/institution/:id" element={<InstitutionPage />} />
          <Route path="/manage-institution" element={<ManageInstitutionPage />} />
          <Route path="/pass" element={<FamilyPassPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
        
        <BottomNav />
        <AIAssistant />
        
        {/* Modals managed by Context state */}
        {uiState.activeModal === 'scan' && <ScanModal />}
        {uiState.activeModal === 'bookings' && <BookingsModal />}
        {uiState.activeModal === 'wallet' && <WalletModal />}
        {uiState.activeModal === 'notifications' && <NotificationsModal />}
        {uiState.activeModal === 'doctor_consultation' && <DoctorConsultationModal />}
        {uiState.activeModal === 'add_review' && <AddReviewModal />}
        {uiState.activeModal === 'booking_create' && <BookingCreationModal />}
        {uiState.activeModal === 'child_profile' && <ChildProfileModal />}
        {uiState.activeModal === 'product_details' && <ProductDetailsModal />}
        {uiState.activeModal === 'cart' && <CartModal />}
        {uiState.activeModal === 'chat_list' && <ChatListModal />}
        {uiState.activeModal === 'chat_room' && <ChatRoomModal />}
        {uiState.activeModal === 'payment' && <PaymentModal />}
      </div>
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <HashRouter>
          <AppLayout />
        </HashRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}