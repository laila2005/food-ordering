import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderTracking } from '../../hooks/useOrderTracking';
import { ShieldCheck, Truck, Package, Utensils, CheckCircle, AlertTriangle } from 'lucide-react';

export function OrderTracking({ orderId }) {
  const { t, i18n } = useTranslation();
  const { token } = useAuthStore();
  const { status, setStatus, loading, error } = useOrderTracking(orderId, token);
  const [orderDetails, setOrderDetails] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  const currentLang = i18n.language.startsWith('ar') ? 'ar' : 'en';

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
        console.error(err);
      } finally {
        setFetchLoading(false);
      }
    };

    if (orderId && token) {
      fetchOrderDetails();
    }
  }, [orderId, token]);

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
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          {t('orders.trackingTitle')}
        </h1>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
            {t('orders.orderId')}: #{orderId.substring(0, 8)}
          </span>
        </div>
      </div>

      {/* Live Track Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-10">
        
        {isCancelled ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="p-4 bg-red-50 text-red-500 rounded-full border border-red-100">
              <AlertTriangle size={36} />
            </div>
            <h3 className="font-extrabold text-lg text-slate-800">
              {t('status.Cancelled')}
            </h3>
            <p className="text-xs text-slate-400 font-semibold max-w-[240px]">
              This order has been cancelled by the administration.
            </p>
          </div>
        ) : (
          /* Timeline Steps */
          <div className="relative">
            {/* Progress bar line */}
            <div className="absolute top-6 start-6 end-6 h-1 bg-slate-100 -z-10 hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                style={{
                  width: `${(currentStepIndex / (steps.length - 1)) * 100}%`
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
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-lg shadow-amber-500/10'
                          : isActive
                          ? 'bg-white text-amber-500 border-amber-500 scale-110 shadow-lg shadow-amber-500/15'
                          : 'bg-white text-slate-300 border-slate-100'
                      }`}
                    >
                      <StepIcon size={20} />
                      {isActive && (
                        <span className="absolute -inset-1.5 border border-amber-500/30 rounded-full animate-ping -z-10" />
                      )}
                    </div>

                    {/* Step Title Label */}
                    <div className="sm:mt-4 space-y-1">
                      <h4
                        className={`text-sm font-extrabold tracking-tight transition-colors ${
                          isActive
                            ? 'text-amber-500'
                            : isCompleted
                            ? 'text-slate-800'
                            : 'text-slate-400'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
            {/* Delivery details */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
                {t('orders.address')}
              </h3>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                {orderDetails.deliveryAddress}
              </p>
            </div>

            {/* Order contents */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
                {t('orders.summary')}
              </h3>
              <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-3">
                {orderDetails.items.map((item, idx) => {
                  const prodName = item.productName?.[currentLang] || item.productName?.['en'] || '';
                  return (
                    <div key={idx} className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-600">
                        {prodName} <span className="text-slate-400">x{item.quantity}</span>
                      </span>
                      <span className="text-slate-800">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="pt-2.5 border-t border-slate-200/50 flex justify-between items-center text-sm font-black">
                  <span className="text-slate-800">Total</span>
                  <span className="text-amber-600">${orderDetails.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
