import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  ShoppingBag, 
  Search, 
  Truck, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  Compass, 
  History, 
  ChefHat, 
  PackageCheck,
  ClipboardList
} from 'lucide-react';
import { STATIC_ORDERS } from '../../store/staticCatalog';

export function TrackDashboard({ onTrackOrder, onNavigate }) {
  const { t, i18n } = useTranslation();
  const { token, user } = useAuthStore();
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchError, setSearchError] = useState('');

  const currentLang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const isRtl = i18n.language.startsWith('ar');

  useEffect(() => {
    const fetchActiveOrders = async () => {
      if (!token) return;
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/api/orders/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          if (response.status === 401) {
            useAuthStore.getState().logout();
            throw new Error('Your session has expired. Please log in again.');
          }
          throw new Error('Failed to retrieve active orders.');
        }

        const data = await response.json();
        // Filter orders that are not yet Delivered or Cancelled
        const active = data.filter(order => order.status !== 'Delivered' && order.status !== 'Cancelled');
        setActiveOrders(active);
      } catch (err) {
        console.warn('API fetch active orders failed, looking for offline fallback:', err);
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('Failed') || err.message.includes('fetch')) {
          const localOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
          const myLocalOrders = localOrders.filter(o => o.userId === user?.id);
          const allOrders = [...myLocalOrders, ...STATIC_ORDERS];
          const active = allOrders.filter(order => order.status !== 'Delivered' && order.status !== 'Cancelled');
          setActiveOrders(active);
          setError(null);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchActiveOrders();
  }, [token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchId.trim()) {
      setSearchError(t('orders.orderSearchError'));
      return;
    }
    setSearchError('');
    onTrackOrder(searchId.trim());
  };

  // Helper to determine active step index
  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Preparing': return 1;
      case 'OutForDelivery': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Title Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white rounded-2xl shadow-lg shadow-brand-primary/20">
            <Truck className="animate-bounce" size={24} />
          </div>
          <h1 className="text-2xl font-black text-text-main tracking-tight">
            {t('orders.trackDashboard')}
          </h1>
        </div>
        <p className="text-text-muted text-sm font-medium">
          {user ? t('orders.activeOrders') : t('orders.enterOrderId')}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-3xl text-sm font-bold text-center border border-red-100">
          {error}
        </div>
      ) : user && activeOrders.length > 0 ? (
        /* Active Orders List */
        <div className="space-y-6">
          {activeOrders.map((order) => {
            const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const date = new Date(order.createdAt).toLocaleDateString(i18n.language, {
              hour: '2-digit',
              minute: '2-digit'
            });
            const currentStep = getStatusStepIndex(order.status);

            const steps = [
              { label: t('status.Pending'), icon: ClipboardList },
              { label: t('status.Preparing'), icon: ChefHat },
              { label: t('status.OutForDelivery'), icon: Truck },
              { label: t('status.Delivered'), icon: PackageCheck },
            ];

            return (
              <div
                key={order.id}
                className="bg-bg-card rounded-3xl border border-border-card shadow-md p-6 hover:shadow-lg transition-colors duration-300 relative overflow-hidden group"
              >
                {/* Visual Accent Bar */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to" />

                {/* Top Row: Meta and Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-card pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-brand-primary uppercase tracking-wide">
                        #{order.id.substring(0, 8)}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-brand-light text-brand-text animate-pulse border border-brand-primary/10">
                        {t(`status.${order.status}`)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        <span>{date}</span>
                      </span>
                      <span className="w-1 h-1 bg-border-card rounded-full" />
                      <span>{itemsCount} {t('orders.itemsCount')}</span>
                      <span className="w-1 h-1 bg-border-card rounded-full" />
                      <span className="font-bold text-text-main">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onTrackOrder(order.id)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-extrabold text-xs rounded-2xl shadow-md shadow-brand-primary/10 hover:opacity-90 active:scale-95 transition-all cursor-pointer self-start md:self-center"
                  >
                    <span>{t('orders.trackBtn')}</span>
                    <ArrowRight size={14} className={`transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </button>
                </div>

                {/* Bottom Row: Mini-Progress Meter */}
                <div className="pt-6">
                  {/* Progress Line */}
                  <div className="relative flex justify-between items-center max-w-2xl mx-auto px-4">
                    {/* Background track line */}
                    <div className="absolute top-4 left-4 right-4 h-1 bg-bg-app -z-10 rounded-full" />
                    {/* Active progress bar line */}
                    <div 
                      className="absolute top-4 left-4 h-1 bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to -z-10 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(currentStep / (steps.length - 1)) * 100}%`,
                        right: isRtl ? 'auto' : undefined,
                        left: isRtl ? 'auto' : '1rem'
                      }}
                    />

                    {steps.map((step, idx) => {
                      const StepIcon = step.icon;
                      const isCompleted = idx < currentStep;
                      const isActive = idx === currentStep;

                      return (
                        <div key={idx} className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            isActive 
                              ? 'bg-brand-primary border-brand-primary text-white shadow-md ring-4 ring-brand-light'
                              : isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-bg-card border-border-card text-text-muted'
                          }`}>
                            <StepIcon size={14} />
                          </div>
                          <span className={`text-[10px] font-black text-center max-w-[70px] ${
                            isActive 
                              ? 'text-brand-text'
                              : isCompleted
                              ? 'text-emerald-600'
                              : 'text-text-muted'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Manual ID Search / Empty State */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Main Search Panel */}
          <div className="bg-bg-card rounded-3xl border border-border-card shadow-md p-8 md:col-span-3 flex flex-col justify-center space-y-6 transition-colors duration-300">
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-text-main tracking-tight">
                {t('orders.enterOrderId')}
              </h2>
              <p className="text-text-muted text-xs font-semibold leading-relaxed">
                {!user 
                  ? "Logged out? You can still track your order live using the receipt ID sent to your phone or confirmation screen."
                  : t('orders.noActiveOrders')}
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder={t('orders.orderIdPlaceholder')}
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-bg-app border border-border-card rounded-2xl text-text-main font-semibold text-sm placeholder:text-text-muted/80 focus:bg-bg-card focus:border-brand-primary focus:outline-none transition-all"
                />
              </div>
              {searchError && (
                <p className="text-xs font-black text-red-500 px-2">{searchError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-black text-sm rounded-2xl shadow-lg shadow-brand-primary/10 hover:opacity-90 transition-all active:scale-98 cursor-pointer text-center"
              >
                {t('orders.orderSearchBtn')}
              </button>
            </form>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-bg-card text-text-main rounded-3xl border border-border-card p-8 md:col-span-2 flex flex-col justify-between space-y-8 shadow-md relative overflow-hidden transition-colors duration-300">
            {/* Visual background lights */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl" />

            <div className="space-y-2 relative">
              <h3 className="text-lg font-black tracking-tight">{t('orders.quickShortcuts')}</h3>
              <p className="text-text-muted text-xs font-medium leading-relaxed">
                Hungry or looking for your order history? Jump straight there with these shortcuts.
              </p>
            </div>

            <div className="space-y-3 relative">
              <button
                onClick={() => onNavigate('menu')}
                className="w-full flex items-center justify-between p-4 bg-bg-app hover:bg-border-card/50 rounded-2xl border border-border-card transition-all text-start cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-primary/20 text-brand-primary rounded-xl">
                    <Compass size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold">{t('orders.browseMenu')}</h4>
                    <p className="text-[10px] text-text-muted mt-0.5">Explore our delicious food</p>
                  </div>
                </div>
                <ArrowRight size={16} className={`text-text-muted ${isRtl ? 'rotate-180' : ''}`} />
              </button>

              {user && (
                <button
                  onClick={() => onNavigate('orders')}
                  className="w-full flex items-center justify-between p-4 bg-bg-app hover:bg-border-card/50 rounded-2xl border border-border-card transition-all text-start cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-primary/20 text-brand-primary rounded-xl">
                      <History size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold">{t('orders.viewPastOrders')}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">View your complete history</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className={`text-text-muted ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
