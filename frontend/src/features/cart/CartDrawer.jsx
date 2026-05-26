import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { X, Plus, Minus, Trash2, MapPin, CreditCard, DollarSign } from 'lucide-react';

export function CartDrawer({ isOpen, onClose, onOpenAuth, onCheckoutSuccess }) {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuthStore();
  const { items, addItem, removeItem, clearCart, getTotalAmount } = useCartStore();
  
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CashOnDelivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentLang = i18n.language.startsWith('ar') ? 'ar' : 'en';

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      onOpenAuth();
      return;
    }

    if (!address.trim()) {
      setError(t('cart.address') + ' is required.');
      return;
    }

    setLoading(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const orderBody = {
      paymentMethod,
      deliveryAddress: address,
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    try {
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderBody)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error creating order.');
      }

      clearCart();
      setAddress('');
      onCheckoutSuccess(data.orderId);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 end-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>{t('cart.title')}</span>
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
                {error}
              </div>
            )}

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="p-4 bg-amber-50 text-amber-500 rounded-full">
                  <Trash2 size={36} />
                </div>
                <p className="text-sm font-semibold text-slate-400 max-w-[200px]">
                  {t('cart.empty')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  if (!item || !item.product) return null;
                  const prodName = item.product.name?.[currentLang] || item.product.name?.['en'] || '';
                  return (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-4 py-3 border-b border-slate-50"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={prodName}
                        className="w-16 h-16 rounded-2xl object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-800 truncate">
                          {prodName}
                        </h4>
                        <span className="text-xs font-bold text-slate-400 block mt-0.5">
                          ${(item.product.price || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/50 px-2 py-1 rounded-xl">
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-0.5 rounded text-slate-500 hover:bg-slate-200 active:scale-90"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-black text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => addItem(item.product)}
                          className="p-0.5 rounded text-slate-500 hover:bg-slate-200 active:scale-90"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Shipping / Checkout Form Details */}
                <form onSubmit={handleCheckout} className="space-y-4 pt-4">
                  {/* Delivery Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{t('cart.address')}</span>
                    </label>
                    <textarea
                      required
                      rows="2"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                      placeholder="123 Main St, Apartment 4B"
                    />
                  </div>

                  {/* Payment Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                      {t('cart.paymentMethod')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Cash on Delivery */}
                      <label
                        className={`flex items-center justify-center gap-2 p-3 border rounded-2xl cursor-pointer transition-all ${
                          paymentMethod === 'CashOnDelivery'
                            ? 'border-amber-500 bg-amber-50/50 text-amber-600 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="CashOnDelivery"
                          checked={paymentMethod === 'CashOnDelivery'}
                          onChange={() => setPaymentMethod('CashOnDelivery')}
                          className="sr-only"
                        />
                        <DollarSign size={14} />
                        <span className="text-xs font-bold">{t('cart.cod')}</span>
                      </label>

                      {/* Mock Credit Card */}
                      <label
                        className={`flex items-center justify-center gap-2 p-3 border rounded-2xl cursor-pointer transition-all ${
                          paymentMethod === 'Stripe'
                            ? 'border-amber-500 bg-amber-50/50 text-amber-600 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="Stripe"
                          checked={paymentMethod === 'Stripe'}
                          onChange={() => setPaymentMethod('Stripe')}
                          className="sr-only"
                        />
                        <CreditCard size={14} />
                        <span className="text-xs font-bold">{t('cart.card')}</span>
                      </label>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer Checkouts */}
          {items.length > 0 && (
            <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {t('cart.total')}
                </span>
                <span className="text-2xl font-black text-slate-800">
                  ${getTotalAmount().toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </span>
                ) : (
                  user ? t('cart.checkoutBtn') : t('nav.login')
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
