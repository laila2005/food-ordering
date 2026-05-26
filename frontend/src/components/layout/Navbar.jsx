import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { ShoppingBag, Globe, LogOut, User, LayoutDashboard, UtensilsCrossed } from 'lucide-react';

export function Navbar({ onOpenAuth, onToggleCart, onNavigate }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('menu')}>
            <div className="bg-amber-500 text-white p-2 rounded-xl shadow-md shadow-amber-500/20">
              <UtensilsCrossed size={20} />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              {t('nav.title')}
            </span>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-3">
            {/* Language Switcher (Visible everywhere) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm border border-slate-200/60"
            >
              <Globe size={16} />
              <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Desktop-only Navigation Controls */}
            <div className="hidden sm:flex items-center gap-4">
              {/* Menu Navigation */}
              <button
                onClick={() => onNavigate('menu')}
                className="text-sm font-semibold text-slate-600 hover:text-amber-500 transition-colors"
              >
                {t('nav.menu')}
              </button>

              {/* User Controls */}
              {user ? (
                <div className="flex items-center gap-4">
                  {/* Admin Dashboard Option */}
                  {user.role === 'Admin' && (
                    <button
                      onClick={() => onNavigate('admin')}
                      className="flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg transition-colors border border-amber-200/50"
                    >
                      <LayoutDashboard size={15} />
                      <span className="hidden sm:inline">{t('nav.dashboard')}</span>
                    </button>
                  )}

                  {/* My Orders */}
                  <button
                    onClick={() => onNavigate('orders')}
                    className="text-sm font-semibold text-slate-600 hover:text-amber-500 transition-colors"
                  >
                    {t('nav.myOrders')}
                  </button>

                  {/* Profile display & Logout */}
                  <div className="flex items-center gap-3 border-s border-slate-200 ps-4">
                    <div className="hidden lg:flex flex-col text-end">
                      <span className="text-sm font-bold text-slate-800 leading-none">{user.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                        {user.role === 'Admin' ? t('auth.adminBadge') : ''}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('nav.logout')}
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600 hover:shadow-amber-500/30 active:scale-95 transition-all"
                >
                  <User size={16} />
                  <span>{t('nav.login')}</span>
                </button>
              )}

              {/* Shopping Cart Trigger */}
              <button
                onClick={onToggleCart}
                className="relative p-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl transition-all active:scale-95"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -end-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full border-2 border-white shadow-sm animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Tab Bar for Mobile Viewports */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-lg px-6 py-2.5 flex justify-between items-center text-slate-500 pb-safe">
        {/* Menu Tab */}
        <button
          onClick={() => onNavigate('menu')}
          className="flex flex-col items-center gap-1 hover:text-amber-500 text-slate-500 transition-colors"
        >
          <UtensilsCrossed size={18} />
          <span className="text-[9px] font-bold">{t('nav.menu')}</span>
        </button>

        {/* My Orders Tab */}
        {user && (
          <button
            onClick={() => onNavigate('orders')}
            className="flex flex-col items-center gap-1 hover:text-amber-500 text-slate-500 transition-colors"
          >
            <ShoppingBag size={18} />
            <span className="text-[9px] font-bold">{t('nav.myOrders')}</span>
          </button>
        )}

        {/* Admin Dashboard Tab */}
        {user && user.role === 'Admin' && (
          <button
            onClick={() => onNavigate('admin')}
            className="flex flex-col items-center gap-1 hover:text-amber-500 text-slate-500 transition-colors"
          >
            <LayoutDashboard size={18} />
            <span className="text-[9px] font-bold">{t('nav.dashboard')}</span>
          </button>
        )}

        {/* Shopping Cart Trigger */}
        <button
          onClick={onToggleCart}
          className="relative flex flex-col items-center gap-1 hover:text-amber-500 text-slate-500 transition-colors"
        >
          <div className="relative">
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -end-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-[8px] px-1.5 py-0.5 rounded-full border border-white shadow-xs">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold">{t('nav.cart') || 'Cart'}</span>
        </button>

        {/* Auth / Logout Tab */}
        {user ? (
          <button
            onClick={logout}
            className="flex flex-col items-center gap-1 hover:text-red-500 text-slate-400 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-[9px] font-bold">{t('nav.logout')}</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex flex-col items-center gap-1 hover:text-amber-500 text-slate-500 transition-colors"
          >
            <User size={18} />
            <span className="text-[9px] font-bold">{t('nav.login')}</span>
          </button>
        )}
      </div>
    </nav>
  );
}
