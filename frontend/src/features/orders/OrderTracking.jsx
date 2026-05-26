import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderTracking } from '../../hooks/useOrderTracking';
import { ShieldCheck, Truck, Package, Utensils, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { STATIC_ORDERS } from '../../store/staticCatalog';

export function OrderTracking({ orderId, onBack }) {
  const { t, i18n } = useTranslation();
  const { token, user } = useAuthStore();
  const { status, setStatus, loading, error } = useOrderTracking(orderId, token);
  const [orderDetails, setOrderDetails] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [accessError, setAccessError] = useState(null);

  const currentLang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const isRtl = i18n.language.startsWith('ar');

  useEffect(() => {
    // Fetch initial order details
    const fetchOrderDetails = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        setFetchLoading(true);
        const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to retrieve order tracking info.');
        }

        const data = await response.json();
        setOrderDetails(data);
        setStatus(data.status); // Seed the tracking hook state with the database state
      } catch (err) {
        console.warn('API fetch order details failed, looking for offline fallback:', err);
        const localOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
        const allOrders = [...localOrders, ...STATIC_ORDERS];
        const foundOrder = allOrders.find(o => o.id === orderId);
        if (foundOrder) {
          // Check ownership
          if (foundOrder.userId && foundOrder.userId !== user?.id) {
            setAccessError("Access Denied: You do not have permission to track this order.");
            setFetchLoading(false);
            return;
          }
          setOrderDetails(foundOrder);
          setStatus(foundOrder.status);
        } else {
          // If not found anywhere, create a quick fallback order
          const fallbackOrder = {
            id: orderId,
            customerName: "Guest Customer",
            createdAt: new Date().toISOString(),
            totalAmount: 0.00,
            paymentMethod: "CashOnDelivery",
            deliveryAddress: "Mock Cloud Deployment Blvd",
            addressDetails: "",
            phoneNumber: "",
            notes: "",
            status: "Pending",
            items: []
          };
          setOrderDetails(fallbackOrder);
          setStatus(fallbackOrder.status);
        }
      } finally {
        setFetchLoading(false);
      }
    };

    if (orderId && token) {
      fetchOrderDetails();
    }
  }, [orderId, token, user?.id]);

  if (accessError) {
    return (
      <div className="max-w-md mx-auto space-y-6 py-20 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-bg-card rounded-3xl border border-border-card p-10 flex flex-col items-center justify-center space-y-5 shadow-xl">
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/10 animate-bounce">
            <AlertTriangle size={36} />
          </div>
          <h2 className="text-xl font-black text-text-main tracking-tight">
            {t('orders.accessDenied', 'Access Denied')}
          </h2>
          <p className="text-xs text-text-muted font-bold max-w-[280px] leading-relaxed">
            {accessError}
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-bg-app hover:bg-rose-500 hover:text-white text-text-main font-extrabold text-xs rounded-2xl transition-all shadow-xs border border-border-card hover:border-rose-500 cursor-pointer"
          >
            {t('orders.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  if (fetchLoading || loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <svg className="animate-spin h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const steps = [
    { key: 'Pending', icon: ShieldCheck, label: t('status.Pending') },
    { key: 'Preparing', icon: Utensils, label: t('status.Preparing') },
    { key: 'OutForDelivery', icon: Truck, label: t('status.OutForDelivery') },
    { key: 'Delivered', icon: CheckCircle, label: t('status.Delivered') }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === status);
  const isCancelled = status === 'Cancelled';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-bg-card hover:bg-bg-app text-text-muted hover:text-text-main font-extrabold text-xs rounded-2xl shadow-xs border border-border-card transition-all cursor-pointer select-none"
        >
          <ArrowLeft size={14} className={isRtl ? 'rotate-180' : ''} />
          <span>{t('orders.backToDashboard')}</span>
        </button>
      )}

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-text-main tracking-tight">
          {t('orders.trackingTitle')}
        </h1>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-light rounded-full border border-brand-primary/10">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-black uppercase text-brand-text tracking-wider">
            {t('orders.orderId')}: #{orderId.substring(0, 8)}
          </span>
        </div>
      </div>

      {/* Live Track Card */}
      <div className="bg-bg-card rounded-3xl border border-border-card shadow-xl p-8 space-y-10">
        
        {isCancelled ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/10">
              <AlertTriangle size={36} />
            </div>
            <h3 className="font-extrabold text-lg text-text-main">
              {t('status.Cancelled')}
            </h3>
            <p className="text-xs text-text-muted font-semibold max-w-[240px]">
              This order has been cancelled by the administration.
            </p>
          </div>
        ) : (
          /* Timeline Steps */
          <div className="relative">
            {/* Progress bar line - Horizontal for desktop, Vertical for mobile */}
            <div className="absolute top-6 start-6 end-6 h-1 bg-bg-app -z-10 hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to transition-all duration-700"
                style={{
                  width: `${(currentStepIndex / (steps.length - 1)) * 100}%`
                }}
              />
            </div>

            <div className="absolute top-6 bottom-6 start-6 w-1 bg-bg-app -z-10 sm:hidden">
              <div
                className="w-full bg-gradient-to-b from-brand-gradient-from to-brand-gradient-to transition-all duration-700"
                style={{
                  height: `${(currentStepIndex / (steps.length - 1)) * 100}%`
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx < currentStepIndex;
                const isActive = idx === currentStepIndex;
                const isPending = idx > currentStepIndex;

                return (
                  <div key={step.key} className="flex sm:flex-col items-center gap-4 sm:gap-0 text-start sm:text-center">
                    
                    {/* Circle Pin Icon */}
                    <div
                      className={`relative h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white border-transparent shadow-lg shadow-brand-primary/10'
                          : isActive
                          ? 'bg-bg-card text-brand-primary border-brand-primary scale-110 shadow-lg shadow-brand-primary/15'
                          : 'bg-bg-card text-text-muted border-border-card'
                      }`}
                    >
                      <StepIcon size={20} />
                      {isActive && (
                        <span className="absolute -inset-1.5 border border-brand-primary/30 rounded-full animate-ping -z-10" />
                      )}
                    </div>

                    {/* Step Title Label */}
                    <div className="sm:mt-4 space-y-1">
                      <h4
                        className={`text-sm font-extrabold tracking-tight transition-colors ${
                          isActive
                            ? 'text-brand-primary'
                            : isCompleted
                            ? 'text-text-main'
                            : 'text-text-muted'
                        }`}
                      >
                        {step.label}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Address and Items summary */}
        {orderDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border-card">
            {/* Delivery details */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-text-main tracking-tight">
                {t('orders.address')}
              </h3>
              <div className="text-xs font-semibold text-text-muted leading-relaxed bg-bg-app p-4 border border-border-card rounded-2xl space-y-2.5">
                <div>
                  <span className="block text-[10px] font-black uppercase text-text-muted mb-0.5">{t('orders.address')}</span>
                  <span className="text-text-main">{orderDetails.deliveryAddress}</span>
                </div>
                {orderDetails.addressDetails && (
                  <div>
                    <span className="block text-[10px] font-black uppercase text-text-muted mb-0.5">{t('orders.landmark')}</span>
                    <span className="text-text-main">{orderDetails.addressDetails}</span>
                  </div>
                )}
                {orderDetails.phoneNumber && (
                  <div>
                    <span className="block text-[10px] font-black uppercase text-text-muted mb-0.5">{t('orders.phone')}</span>
                    <span className="text-text-main">{orderDetails.phoneNumber}</span>
                  </div>
                )}
                {orderDetails.notes && (
                  <div className="border-t border-border-card pt-2">
                    <span className="block text-[10px] font-black uppercase text-brand-text mb-0.5">{t('orders.notes')}</span>
                    <span className="text-text-main italic bg-brand-light/30 p-2 rounded-lg border border-brand-primary/10 block">{orderDetails.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order contents */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-text-main tracking-tight">
                {t('orders.summary')}
              </h3>
              <div className="bg-bg-app p-4 border border-border-card rounded-2xl space-y-3">
                {orderDetails.items.map((item, idx) => {
                  const prodName = item.productName?.[currentLang] || item.productName?.['en'] || '';
                  return (
                    <div key={idx} className="flex justify-between items-center text-xs font-bold">
                      <span className="text-text-main">
                        {prodName} <span className="text-text-muted">x{item.quantity}</span>
                      </span>
                      <span className="text-text-main">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="pt-2.5 border-t border-border-card flex justify-between items-center text-sm font-black">
                  <span className="text-text-main">Total</span>
                  <span className="text-brand-primary">${orderDetails.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
