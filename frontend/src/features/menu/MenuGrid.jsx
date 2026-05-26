import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../../components/common/SkeletonLoader';
import { ProductDetailsModal } from './ProductDetailsModal';
import { useToast } from '../../components/common/ToastProvider';
import { Search, X, UtensilsCrossed, Heart } from 'lucide-react';

export function MenuGrid({ onProductAdded }) {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quick View Modal States
  const [selectedQuickProduct, setSelectedQuickProduct] = useState(null);

  const currentLang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        // Fetch categories and products concurrently
        const [catsRes, prodsRes] = await Promise.all([
          fetch(`${apiUrl}/api/menu/categories`),
          fetch(`${apiUrl}/api/menu/products${selectedCategory && selectedCategory !== 'favorites' ? `?categoryId=${selectedCategory}` : ''}`)
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

  // Client side instant search filtering
  const filteredProducts = products.filter((prod) => {
    if (selectedCategory === 'favorites') {
      try {
        const favs = JSON.parse(localStorage.getItem('fav_products') || '[]');
        if (!favs.includes(prod.id)) return false;
      } catch {
        return false;
      }
    }
    const name = (prod.name[currentLang] || prod.name['en'] || '').toLowerCase();
    const desc = (prod.description[currentLang] || prod.description['en'] || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    return name.includes(query) || desc.includes(query);
  });

  const handleProductAddedNotification = (msg) => {
    if (onProductAdded) onProductAdded();
    if (msg) showToast(msg, 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Menu Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-text-main tracking-tight leading-none flex items-center justify-center gap-2">
          <span>{t('menu.title')}</span>
        </h1>
        <p className="text-sm font-semibold text-text-muted">
          {t('menu.subtitle')}
        </p>
      </div>

      {/* Search & Favorites Filtering Container */}
      <div className="max-w-lg mx-auto flex gap-3 items-center px-2">
        <div className="relative flex-1 group">
          <Search className="absolute start-6 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-brand-primary" size={18} />
          <input
            type="text"
            placeholder={i18n.language.startsWith('ar') ? 'ابحث عن وجبتك اللذيذة...' : 'Search for your favorite food...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-12 pe-10 py-3.5 bg-bg-card border border-border-card rounded-[22px] text-xs text-text-main font-semibold placeholder:text-text-muted/65 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all shadow-xs text-start"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute end-6 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main p-0.5 rounded-full hover:bg-bg-app transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dynamic Favorites Filter Toggle */}
        <button
          onClick={() => {
            setSelectedCategory(selectedCategory === 'favorites' ? null : 'favorites');
            setSearchQuery('');
          }}
          className={`flex-shrink-0 p-3.5 rounded-[22px] border transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
            selectedCategory === 'favorites'
              ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20'
              : 'bg-bg-card text-text-muted hover:text-red-500 border-border-card'
          }`}
          title={i18n.language.startsWith('ar') ? 'عرض المفضلة فقط' : 'Show favorites only'}
        >
          <Heart size={18} fill={selectedCategory === 'favorites' ? 'currentColor' : 'none'} />
          <span className="hidden sm:inline text-xs font-black uppercase tracking-wider">
            {t('menu.favorites')}
          </span>
        </button>
      </div>

      {/* Categories Tabs Selector */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center px-2">
        {/* All Option */}
        <button
          onClick={() => {
            setSelectedCategory(null);
            setSearchQuery('');
          }}
          className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-xs font-black tracking-wide uppercase transition-all duration-300 border cursor-pointer ${
            selectedCategory === null
              ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20 active:scale-95'
              : 'bg-bg-card text-text-muted hover:text-brand-primary hover:bg-bg-app border-border-card'
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
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery('');
              }}
              className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-xs font-black tracking-wide uppercase transition-all duration-300 border cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20 active:scale-95'
                  : 'bg-bg-card text-text-muted hover:text-brand-primary hover:bg-bg-app border-border-card'
              }`}
            >
              {catName}
            </button>
          );
        })}
      </div>

      {/* Grid Status Handling */}
      {loading ? (
        /* Shimmer Skeleton cards instead of standard spinner */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-3xl text-sm font-bold text-center border border-red-100 max-w-md mx-auto">
          {error}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-bg-card rounded-3xl border border-border-card p-16 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto shadow-sm animate-in fade-in duration-300">
          <div className="p-4 bg-bg-app rounded-full text-text-muted">
            {selectedCategory === 'favorites' ? (
              <Heart size={36} className="text-red-500" fill="currentColor" />
            ) : (
              <UtensilsCrossed size={36} />
            )}
          </div>
          <h3 className="font-extrabold text-text-main text-sm">
            {selectedCategory === 'favorites' 
              ? (i18n.language.startsWith('ar') ? 'قائمتك المفضلة فارغة' : 'Your Favorites is empty')
              : (i18n.language.startsWith('ar') ? 'لا توجد نتائج' : 'No items found')}
          </h3>
          <p className="text-xs font-semibold text-text-muted max-w-[240px] leading-relaxed">
            {selectedCategory === 'favorites'
              ? (i18n.language.startsWith('ar') 
                  ? 'اضغط على زر القلب في أي وجبة لإضافتها إلى قائمتك المفضلة هنا!' 
                  : 'Tap the heart icon on any delicious dish to add it to your personal favorites!')
              : (i18n.language.startsWith('ar')
                  ? 'لم نجد أي وجبات تطابق بحثك. جرب كلمة بحث أخرى!'
                  : "We couldn't find any dishes matching your query. Try a different search word!")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-2">
          {filteredProducts.map((prod) => (
            <ProductCard 
              key={prod.id} 
              product={prod} 
              onProductAdded={onProductAdded} 
              onQuickView={(p) => setSelectedQuickProduct(p)} 
            />
          ))}
        </div>
      )}

      {/* Dynamic Quick View Modal */}
      <ProductDetailsModal
        product={selectedQuickProduct}
        isOpen={selectedQuickProduct !== null}
        onClose={() => setSelectedQuickProduct(null)}
        onProductAdded={handleProductAddedNotification}
      />
    </div>
  );
}
