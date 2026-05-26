import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from './components/layout/Navbar';
import { AuthModal } from './features/auth/AuthModal';
import { CartDrawer } from './features/cart/CartDrawer';
import { MenuGrid } from './features/menu/MenuGrid';
import { OrderHistory } from './features/orders/OrderHistory';
import { OrderTracking } from './features/orders/OrderTracking';
import { AdminDashboard } from './features/admin/AdminDashboard';
import './i18n/i18n'; // Load dynamic translation files
import './App.css';

export default function App() {
  const { i18n } = useTranslation();
  const [activePage, setActivePage] = useState('menu');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Sync document attributes with active i18next language configurations
    const currentLang = i18n.language || 'en';
    const direction = currentLang.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  const handleTrackOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setActivePage('tracking');
  };

  const handleCheckoutSuccess = (orderId) => {
    setSelectedOrderId(orderId);
    setActivePage('tracking');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-300">
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onToggleCart={() => setIsCartOpen(!isCartOpen)}
        onNavigate={(page) => setActivePage(page)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activePage === 'menu' && <MenuGrid />}
        {activePage === 'orders' && <OrderHistory onTrackOrder={handleTrackOrder} />}
        {activePage === 'tracking' && selectedOrderId && <OrderTracking orderId={selectedOrderId} />}
        {activePage === 'admin' && <AdminDashboard />}
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
