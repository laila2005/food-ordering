import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from './components/layout/Navbar';
import { AuthModal } from './features/auth/AuthModal';
import { CartDrawer } from './features/cart/CartDrawer';
import { MenuGrid } from './features/menu/MenuGrid';
import { OrderHistory } from './features/orders/OrderHistory';
import { OrderTracking } from './features/orders/OrderTracking';
import { TrackDashboard } from './features/orders/TrackDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { useAuthStore } from './store/useAuthStore';
import './i18n/i18n'; // Load dynamic translation files
import './App.css';

export default function App() {
  const { i18n } = useTranslation();
  const [activePage, setActivePage] = useState('menu');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { user } = useAuthStore();

  useEffect(() => {
    // Sync document attributes with active i18next language configurations
    const currentLang = i18n.language || 'en';
    const direction = currentLang.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  useEffect(() => {
    // Route guard: Redirect standard users away from the Admin Dashboard
    if (activePage === 'admin' && user?.role !== 'Admin') {
      setActivePage('menu');
    }
  }, [user, activePage]);

  const handleTrackOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setActivePage('tracking');
  };

  const handleCheckoutSuccess = (orderId) => {
    setSelectedOrderId(orderId);
    setActivePage('tracking');
  };

  return (
    <div className="min-h-screen bg-bg-app text-text-main transition-colors duration-300">
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onToggleCart={() => setIsCartOpen(!isCartOpen)}
        onNavigate={(page) => {
          setActivePage(page);
          if (page === 'tracking') {
            setSelectedOrderId(null);
          }
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
        {activePage === 'menu' && <MenuGrid onProductAdded={() => {}} />}
        {activePage === 'orders' && <OrderHistory onTrackOrder={handleTrackOrder} />}
        {activePage === 'tracking' && (
          selectedOrderId ? (
            <OrderTracking 
              orderId={selectedOrderId} 
              onBack={() => setSelectedOrderId(null)} 
            />
          ) : (
            <TrackDashboard 
              onTrackOrder={handleTrackOrder} 
              onNavigate={(page) => setActivePage(page)} 
            />
          )
        )}
        {activePage === 'admin' && user?.role === 'Admin' && <AdminDashboard />}
      </main>

      {/* Overlays */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenAuth={() => {
          setIsCartOpen(false);
          setIsAuthOpen(true);
        }}
        onCheckoutSuccess={handleCheckoutSuccess}
      />
    </div>
  );
}
