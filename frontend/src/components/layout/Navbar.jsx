import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { ShoppingBag, Globe, LogOut, User, LayoutDashboard, UtensilsCrossed, Truck, Sparkles, Leaf, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function Navbar({ onOpenAuth, onToggleCart, onNavigate }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { theme, changeTheme } = useTheme();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const toggleTheme = () => {
    if (theme === 'sunset') changeTheme('forest');
    else if (theme === 'forest') changeTheme('velvet');
    else changeTheme('sunset');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-bg-card/85 backdrop-blur-md border-b border-border-card text-text-main shadow-xs transition-colors duration-300">
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
              {/* Theme Cycle Switcher */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-muted hover:bg-bg-app transition-all font-medium text-xs border border-border-card cursor-pointer uppercase tracking-wider select-none"
                title="Toggle visual theme"
              >
                {theme === 'sunset' && <Sparkles size={14} className="text-amber-500 animate-pulse" />}
                {theme === 'forest' && <Leaf size={14} className="text-emerald-500 animate-bounce" />}
                {theme === 'velvet' && <Moon size={14} className="text-orange-500" />}
                <span className="hidden sm:inline font-black text-[10px]">
                  {theme === 'sunset' ? 'Gold' : theme === 'forest' ? 'Forest' : 'Night'}
                </span>
              </button>

              {/* Language Switcher (Visible everywhere) */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-muted hover:bg-bg-app transition-all font-medium text-xs border border-border-card cursor-pointer select-none"
              >
                <Globe size={14} />
                <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
              </button>

              {/* Desktop-only Navigation Controls */}
              <div className="hidden sm:flex items-center gap-4">
                {/* Menu Navigation */}
                <button
                  onClick={() => onNavigate('menu')}
                  className="text-sm font-semibold text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
                >
                  {t('nav.menu')}
                </button>

                {/* Track Order Tab */}
                <button
                  onClick={() => onNavigate('tracking')}
                  className="text-sm font-semibold text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
                >
                  {t('nav.trackOrder')}
                </button>

                {/* User Controls */}
                {user ? (
                  <div className="flex items-center gap-4">
                    {/* Admin Dashboard Option */}
                    {user.role === 'Admin' && (
                      <button
                        onClick={() => onNavigate('admin')}
                        className="flex items-center gap-1 text-sm font-semibold text-brand-text hover:opacity-90 bg-brand-light px-3 py-1.5 rounded-lg transition-colors border border-brand-primary/10 cursor-pointer"
                      >
                        <LayoutDashboard size={15} />
                        <span className="hidden sm:inline">{t('nav.dashboard')}</span>
                      </button>
                    )}

                    {/* My Orders */}
                    <button
                      onClick={() => onNavigate('orders')}
                      className="text-sm font-semibold text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
                    >
                      {t('nav.myOrders')}
                    </button>

                    {/* Profile display & Logout */}
                    <div className="flex items-center gap-3 border-s border-border-card ps-4">
                      <div className="hidden lg:flex flex-col text-end">
                        <span className="text-sm font-bold text-text-main leading-none">{user.fullName}</span>
                        <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mt-0.5">
                          {user.role === 'Admin' ? t('auth.adminBadge') : ''}
                        </span>
                      </div>
                      <button
                        onClick={logout}
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title={t('nav.logout')}
                      >
                        <LogOut size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-primary/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    <User size={16} />
                    <span>{t('nav.login')}</span>
                  </button>
                )}

                {/* Shopping Cart Trigger */}
                <button
                  onClick={onToggleCart}
                  className="relative p-2.5 bg-bg-app hover:bg-border-card text-text-main border border-border-card rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -end-1.5 bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-black text-[10px] px-2 py-0.5 rounded-full border border-border-card shadow-sm animate-pulse">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Bottom Tab Bar for Mobile Viewports */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-bg-card/90 backdrop-blur-md border-t border-border-card shadow-lg px-6 py-2.5 flex justify-between items-center text-text-muted pb-safe transition-colors duration-300">
        {/* Menu Tab */}
        <button
          onClick={() => onNavigate('menu')}
          className="flex flex-col items-center gap-1 hover:text-brand-primary text-text-muted transition-colors cursor-pointer"
        >
          <UtensilsCrossed size={18} />
          <span className="text-[9px] font-bold">{t('nav.menu')}</span>
        </button>

        {/* Track Order Tab */}
        <button
          onClick={() => onNavigate('tracking')}
          className="flex flex-col items-center gap-1 hover:text-brand-primary text-text-muted transition-colors cursor-pointer"
        >
          <Truck size={18} />
          <span className="text-[9px] font-bold">{t('nav.trackOrder')}</span>
        </button>

        {/* My Orders Tab */}
        {user && (
          <button
            onClick={() => onNavigate('orders')}
            className="flex flex-col items-center gap-1 hover:text-brand-primary text-text-muted transition-colors cursor-pointer"
          >
            <ShoppingBag size={18} />
            <span className="text-[9px] font-bold">{t('nav.myOrders')}</span>
          </button>
        )}

        {/* Admin Dashboard Tab */}
        {user && user.role === 'Admin' && (
          <button
            onClick={() => onNavigate('admin')}
            className="flex flex-col items-center gap-1 hover:text-brand-primary text-text-muted transition-colors cursor-pointer"
          >
            <LayoutDashboard size={18} />
            <span className="text-[9px] font-bold">{t('nav.dashboard')}</span>
          </button>
        )}

        {/* Shopping Cart Trigger */}
        <button
          onClick={onToggleCart}
          className="relative flex flex-col items-center gap-1 hover:text-brand-primary text-text-muted transition-colors cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -end-2 bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-black text-[8px] px-1.5 py-0.5 rounded-full border border-border-card shadow-xs">
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
            className="flex flex-col items-center gap-1 hover:text-red-500 text-text-muted transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span className="text-[9px] font-bold">{t('nav.logout')}</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex flex-col items-center gap-1 hover:text-brand-primary text-text-muted transition-colors cursor-pointer"
          >
            <User size={18} />
            <span className="text-[9px] font-bold">{t('nav.login')}</span>
          </button>
        )}
      </div>
    </>
  );
}
