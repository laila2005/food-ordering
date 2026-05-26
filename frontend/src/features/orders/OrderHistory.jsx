import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { ShoppingBag, ArrowRight, Eye, Calendar, DollarSign, Clock } from 'lucide-react';
import { STATIC_ORDERS } from '../../store/staticCatalog';

export function OrderHistory({ onTrackOrder }) {
  const { t, i18n } = useTranslation();
  const { token, user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentLang = i18n.language.startsWith('ar') ? 'ar' : 'en';

  useEffect(() => {
    const fetchOrders = async () => {
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
          throw new Error('Failed to retrieve order history.');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.warn('API fetch orders failed, checking for offline fallback:', err);
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('Failed') || err.message.includes('fetch')) {
          const localOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
          const myLocalOrders = localOrders.filter(o => o.userId === user?.id);
          const allOrders = [...myLocalOrders, ...STATIC_ORDERS];
          setOrders(allOrders);
          setError(null);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/10">
          <ShoppingBag size={24} />
        </div>
        <h1 className="text-2xl font-black text-text-main tracking-tight">
          {t('orders.historyTitle')}
        </h1>
      </div>

      {/* List */}
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
      ) : orders.length === 0 ? (
        <div className="bg-bg-card rounded-3xl border border-border-card p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-bg-app text-text-muted rounded-full">
            <ShoppingBag size={32} />
          </div>
          <p className="text-sm font-semibold text-text-muted">
            {t('orders.noOrders')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const date = new Date(order.createdAt).toLocaleDateString(i18n.language, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={order.id}
                className="bg-bg-card rounded-3xl border border-border-card shadow-sm p-6 hover:shadow-md transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Meta details */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-brand-primary uppercase tracking-wide">
                      #{order.id.substring(0, 8)}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : order.status === 'Cancelled'
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'bg-brand-light text-brand-text animate-pulse border border-brand-primary/10'
                    }`}>
                      {t(`status.${order.status}`)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      <span>{date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      <span>{itemsCount} {t('orders.itemsCount')}</span>
                    </span>
                    <span className="flex items-center gap-1 font-bold text-text-main">
                      <DollarSign size={13} />
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </span>
                  </div>
                </div>

                {/* Tracking Action Button */}
                <div className="flex items-center">
                  <button
                    onClick={() => onTrackOrder(order.id)}
                    className="flex items-center gap-2 px-5 py-3 bg-bg-app hover:bg-brand-primary hover:text-white text-text-main font-extrabold text-xs rounded-2xl transition-all shadow-xs border border-border-card hover:border-brand-primary cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>{t('orders.trackBtn')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
