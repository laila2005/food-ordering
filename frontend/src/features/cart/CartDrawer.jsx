import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { X, Plus, Minus, Trash2, MapPin, CreditCard, DollarSign, Phone, Info, FileText } from 'lucide-react';

export function CartDrawer({ isOpen, onClose, onOpenAuth, onCheckoutSuccess }) {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuthStore();
  const { items, addItem, removeItem, clearCart, getTotalAmount } = useCartStore();
  
  const [address, setAddress] = useState(() => localStorage.getItem('checkout_address') || '');
  const [phone, setPhone] = useState(() => localStorage.getItem('checkout_phone') || '');
  const [landmark, setLandmark] = useState(() => localStorage.getItem('checkout_landmark') || '');
  const [notes, setNotes] = useState(() => localStorage.getItem('checkout_notes') || '');
  const [paymentMethod, setPaymentMethod] = useState('CashOnDelivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    localStorage.setItem('checkout_address', address);
  }, [address]);

  React.useEffect(() => {
    localStorage.setItem('checkout_phone', phone);
  }, [phone]);

  React.useEffect(() => {
    localStorage.setItem('checkout_landmark', landmark);
  }, [landmark]);

  React.useEffect(() => {
    localStorage.setItem('checkout_notes', notes);
  }, [notes]);

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

    if (!phone.trim()) {
      setError(t('cart.phoneRequired'));
      return;
    }

    setLoading(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const orderBody = {
      paymentMethod,
      deliveryAddress: address,
      phoneNumber: phone,
      addressDetails: landmark,
      notes: notes,
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

      let data = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        if (response.status === 401) {
          useAuthStore.getState().logout();
          throw new Error('Your session has expired. Please log out and log back in.');
        }
        throw new Error(data?.message || 'Error creating order.');
      }

      clearCart();
      setNotes(''); // Clear only order-specific notes
      onCheckoutSuccess(data.orderId);
      onClose();
    } catch (err) {
      console.warn('Checkout failed, checking for offline fallback:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('Failed') || err.message.includes('fetch')) {
        const mockOrderId = `order-mock-${Date.now()}`;
        const mockOrder = {
          id: mockOrderId,
          customerName: user?.fullName || user?.email?.split('@')[0] || "Guest Customer",
          createdAt: new Date().toISOString(),
          totalAmount: getTotalAmount(),
          paymentMethod: paymentMethod,
          deliveryAddress: address,
          addressDetails: landmark,
          phoneNumber: phone,
          notes: notes,
          status: "Pending",
          items: items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.product.price
          }))
        };

        const localOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
        localOrders.unshift(mockOrder);
        localStorage.setItem('mock_orders', JSON.stringify(localOrders));

        clearCart();
        setNotes('');
        onCheckoutSuccess(mockOrderId);
        onClose();
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 end-0 max-w-full flex">
        <div className="w-screen max-w-md bg-bg-card border-s border-border-card shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 transition-colors duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-border-card flex justify-between items-center bg-bg-app transition-colors duration-300">
            <h2 className="text-lg font-black text-text-main tracking-tight flex items-center gap-2">
              <span>{t('cart.title')}</span>
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-bg-app transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl text-xs font-bold border border-rose-500/10">
                {error}
              </div>
            )}

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="p-4 bg-brand-light text-brand-primary rounded-full">
                  <Trash2 size={36} />
                </div>
                <p className="text-sm font-semibold text-text-muted max-w-[200px]">
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
                      className="flex items-center gap-4 py-3 border-b border-border-card"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={prodName}
                        className="w-16 h-16 rounded-2xl object-cover bg-bg-app flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm text-text-main truncate">
                          {prodName}
                        </h4>
                        <span className="text-xs font-bold text-text-muted block mt-0.5">
                          ${(item.product.price || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2.5 bg-bg-app border border-border-card px-2 py-1 rounded-xl">
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-0.5 rounded text-text-muted hover:bg-border-card active:scale-90 cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-black text-text-main">{item.quantity}</span>
                        <button
                          onClick={() => addItem(item.product)}
                          className="p-0.5 rounded text-text-muted hover:bg-border-card active:scale-90 cursor-pointer"
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
                    <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{t('cart.address')}</span>
                    </label>
                    <textarea
                      required
                      rows="2"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-bg-app border border-border-card rounded-2xl text-xs text-text-main font-semibold focus:outline-none focus:bg-bg-card focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                      placeholder="123 Main St, Apartment 4B"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide flex items-center gap-1">
                      <Phone size={12} />
                      <span>{t('cart.phone')}</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-bg-app border border-border-card rounded-2xl text-xs text-text-main font-semibold focus:outline-none focus:bg-bg-card focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Landmark / Address Details */}
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide flex items-center gap-1">
                      <Info size={12} />
                      <span>{t('cart.landmark')}</span>
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-3 py-2 bg-bg-app border border-border-card rounded-2xl text-xs text-text-main font-semibold focus:outline-none focus:bg-bg-card focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                      placeholder="e.g. Near Grand Mosque, Floor 3, Apt 12"
                    />
                  </div>

                  {/* Notes / Special Instructions */}
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide flex items-center gap-1">
                      <FileText size={12} />
                      <span>{t('cart.notes')}</span>
                    </label>
                    <textarea
                      rows="2"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-bg-app border border-border-card rounded-2xl text-xs text-text-main font-semibold focus:outline-none focus:bg-bg-card focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                      placeholder="e.g. Leave order at front desk, ring bell..."
                    />
                  </div>

                  {/* Payment Selection */}
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">
                      {t('cart.paymentMethod')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Cash on Delivery */}
                      <label
                        className={`flex items-center justify-center gap-2 p-3 border rounded-2xl cursor-pointer transition-all ${
                          paymentMethod === 'CashOnDelivery'
                            ? 'border-brand-primary bg-brand-light text-brand-text font-bold'
                            : 'border-border-card hover:bg-bg-app text-text-muted'
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
                            ? 'border-brand-primary bg-brand-light text-brand-text font-bold'
                            : 'border-border-card hover:bg-bg-app text-text-muted'
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
            <div className="px-6 py-5 border-t border-border-card bg-bg-app space-y-4 transition-colors duration-300">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wide">
                  {t('cart.total')}
                </span>
                <span className="text-2xl font-black text-text-main">
                  ${getTotalAmount().toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to hover:opacity-90 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-brand-primary/10 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
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
