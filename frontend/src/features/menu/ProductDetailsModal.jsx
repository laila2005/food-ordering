import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/useCartStore';
import { X, Clock, Flame, ShieldAlert, Plus, Minus } from 'lucide-react';

export function ProductDetailsModal({ product, isOpen, onClose, onProductAdded }) {
  const { t, i18n } = useTranslation();
  const { addItem } = useCartStore();
  const [customNotes, setCustomNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const currentLang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const productName = product.name[currentLang] || product.name['en'] || '';
  const productDesc = product.description[currentLang] || product.description['en'] || '';

  // Seed realistic premium metadata based on category or name keywords
  const isPizza = productName.toLowerCase().includes('pizza');
  const isBurger = productName.toLowerCase().includes('burger');
  const calories = isPizza ? '780 kcal' : isBurger ? '620 kcal' : '450 kcal';
  const prepTime = isPizza ? '18-22 mins' : isBurger ? '12-15 mins' : '10-12 mins';

  const handleAddToCart = () => {
    // Add multiple quantities with custom instructions cleanly
    for (let i = 0; i < quantity; i++) {
      addItem(product, customNotes.trim());
    }
    if (onProductAdded) {
      onProductAdded(`${quantity}x ${productName} added!`);
    }
    setCustomNotes('');
    setQuantity(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-bg-card w-full max-w-lg rounded-[32px] overflow-hidden border border-border-card shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 flex-shrink-0">
          <img
            src={product.imageUrl}
            alt={productName}
            className="w-full h-full object-cover"
          />
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-900/40 hover:bg-slate-900/60 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Item Name & Details */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-text-main tracking-tight leading-snug">
              {productName}
            </h2>
            <p className="text-xs font-semibold text-text-muted leading-relaxed">
              {productDesc}
            </p>
          </div>

          {/* Premium Metadata Indicators */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 bg-bg-app rounded-2xl border border-border-card">
              <Clock size={16} className="text-brand-primary flex-shrink-0" />
              <div className="min-w-0">
                <span className="block text-[8px] font-black text-text-muted uppercase tracking-wider">Prep Time</span>
                <span className="text-xs font-extrabold text-text-main">{prepTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-bg-app rounded-2xl border border-border-card">
              <Flame size={16} className="text-red-500 flex-shrink-0" />
              <div className="min-w-0">
                <span className="block text-[8px] font-black text-text-muted uppercase tracking-wider">Calories</span>
                <span className="text-xs font-extrabold text-text-main">{calories}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-bg-app rounded-2xl border border-border-card">
              <ShieldAlert size={16} className="text-emerald-500 flex-shrink-0" />
              <div className="min-w-0">
                <span className="block text-[8px] font-black text-text-muted uppercase tracking-wider">Allergens</span>
                <span className="text-xs font-extrabold text-text-main truncate">Dairy / Wheat</span>
              </div>
            </div>
          </div>

          {/* Custom Notes Section */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-text-main uppercase tracking-wide">
              {t('cart.notes')}
            </label>
            <textarea
              rows="2"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g., No cheese, extra spicy, well done..."
              className="w-full px-4 py-3 bg-bg-app border border-border-card rounded-2xl text-xs text-text-main font-semibold placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-6 border-t border-border-card bg-bg-app/40 flex items-center justify-between gap-4 flex-shrink-0">
          {/* Quantity selector */}
          <div className="flex items-center gap-3 bg-bg-card border border-border-card px-3 py-2 rounded-2xl shadow-xs">
            <button
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              className="p-1 rounded text-text-muted hover:bg-bg-app transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-black text-text-main w-6 text-center select-none">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded text-text-muted hover:bg-bg-app transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-black text-sm rounded-2xl shadow-lg shadow-brand-primary/10 hover:from-brand-gradient-from hover:to-brand-gradient-to active:scale-98 transition-all text-center cursor-pointer"
          >
            Add {quantity} to Cart — ${(product.price * quantity).toFixed(2)}
          </button>
        </div>

      </div>
    </div>
  );
}
