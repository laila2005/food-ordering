import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductCard } from './ProductCard';

export function MenuGrid() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentLang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        // Fetch categories and products concurrently
        const [catsRes, prodsRes] = await Promise.all([
          fetch(`${apiUrl}/api/menu/categories`),
          fetch(`${apiUrl}/api/menu/products${selectedCategory ? `?categoryId=${selectedCategory}` : ''}`)
        ]);

        if (!catsRes.ok || !prodsRes.ok) {
          throw new Error('Could not fetch catalog items.');
        }

        const catsData = await catsRes.json();
        const prodsData = await prodsRes.json();

        setCategories(catsData);
        setProducts(prodsData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [selectedCategory, apiUrl]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Menu Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-none">
          {t('menu.title')}
        </h1>
        <p className="text-sm font-semibold text-slate-400">
          {t('menu.subtitle')}
        </p>
      </div>

      {/* Categories Tabs Selector */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
        {/* All Option */}
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-xs font-black tracking-wide uppercase transition-all duration-300 border ${
            selectedCategory === null
              ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20 active:scale-95'
              : 'bg-white text-slate-600 hover:text-amber-500 hover:bg-slate-50 border-slate-200'
          }`}
        >
          {t('menu.all')}
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const catName = cat.name[currentLang] || cat.name['en'] || '';
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-xs font-black tracking-wide uppercase transition-all duration-300 border ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20 active:scale-95'
                  : 'bg-white text-slate-600 hover:text-amber-500 hover:bg-slate-50 border-slate-200'
              }`}
            >
              {catName}
            </button>
          );
        })}
      </div>

      {/* Grid Status Handling */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <svg className="animate-spin h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-3xl text-sm font-bold text-center border border-red-100 max-w-md mx-auto">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
