import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/useCartStore';
import { Plus, ShoppingCart } from 'lucide-react';

export function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const { addItem } = useCartStore();

  const currentLang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  
  // Extract correct dictionary translation based on active language, fallback if not found
  const productName = product.name[currentLang] || product.name['en'] || '';
  const productDesc = product.description[currentLang] || product.description['en'] || '';

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
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
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-extrabold text-lg text-slate-800 tracking-tight group-hover:text-amber-500 transition-colors">
          {productName}
        </h3>
        <p className="mt-2 text-xs font-semibold text-slate-400 leading-relaxed flex-grow line-clamp-3">
          {productDesc}
        </p>

        {/* Pricing & Add to Cart */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              {t('menu.price')}
            </span>
            <span className="text-xl font-black text-slate-800 tracking-tight">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => product.isAvailable && addItem(product)}
            disabled={!product.isAvailable}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-700 font-extrabold text-xs rounded-2xl transition-all shadow-sm group-active:scale-95 disabled:opacity-50 disabled:hover:bg-slate-100 disabled:hover:text-slate-700"
          >
            <Plus size={14} />
            <span>{t('menu.addToCart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
