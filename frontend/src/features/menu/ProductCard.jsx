import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/useCartStore';
import { Plus, Heart, Sparkles } from 'lucide-react';
import { useToast } from '../../components/common/ToastProvider';

export function ProductCard({ product, onProductAdded, onQuickView }) {
  const { t, i18n } = useTranslation();
  const { addItem } = useCartStore();
  const { showToast } = useToast();

  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('fav_products') || '[]');
      return favs.includes(product.id);
    } catch {
      return false;
    }
  });

  const currentLang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  
  const productName = product.name[currentLang] || product.name['en'] || '';
  const productDesc = product.description[currentLang] || product.description['en'] || '';

  const handleFavorite = (e) => {
    e.stopPropagation();
    try {
      const favs = JSON.parse(localStorage.getItem('fav_products') || '[]');
      let updated;
      if (isFavorite) {
        updated = favs.filter(id => id !== product.id);
        showToast(`${productName} removed from favorites.`, 'info');
      } else {
        updated = [...favs, product.id];
        showToast(`${productName} added to favorites! 💖`, 'success');
      }
      localStorage.setItem('fav_products', JSON.stringify(updated));
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.isAvailable) {
      addItem(product);
      if (onProductAdded) onProductAdded();
      showToast(`${productName} added to cart! 🛒`, 'success');
    }
  };

  return (
    <div 
      onClick={() => onQuickView && onQuickView(product)}
      className="group bg-bg-card rounded-[28px] overflow-hidden border border-border-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer relative"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-app">
        <img
          src={product.imageUrl}
          alt={productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Availability Badge */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-lg">
              {t('menu.outOfStock')}
            </span>
          </div>
        )}

        {/* Floating Actions on Image */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* Favorite Like Button */}
          <button
            onClick={handleFavorite}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-90 shadow-sm border border-white/10 cursor-pointer ${
              isFavorite 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-slate-950/40 text-white hover:bg-slate-950/60'
            }`}
          >
            <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Premium Recipe Badge if highly rated */}
        {product.isAvailable && product.price > 12 && (
          <div className="absolute bottom-3 left-3 bg-brand-primary/90 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 backdrop-blur-xs shadow-sm">
            <Sparkles size={10} />
            <span>Premium</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-extrabold text-base text-text-main tracking-tight group-hover:text-brand-primary transition-colors line-clamp-1">
          {productName}
        </h3>
        <p className="mt-1.5 text-xs font-semibold text-text-muted leading-relaxed flex-grow line-clamp-2">
          {productDesc}
        </p>

        {/* Pricing & Add to Cart */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wide">
              {t('menu.price')}
            </span>
            <span className="text-lg font-black text-text-main tracking-tight">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-bg-app hover:bg-brand-primary hover:text-white text-text-main font-black text-xs rounded-2xl transition-all shadow-xs active:scale-95 disabled:opacity-40 disabled:hover:bg-bg-app disabled:hover:text-text-main cursor-pointer border border-border-card"
          >
            <Plus size={14} />
            <span>{t('menu.addToCart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
