import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../../components/common/ToastProvider';
import * as signalR from '@microsoft/signalr';
import { 
  ShieldCheck, 
  Truck, 
  Package, 
  Utensils, 
  CheckCircle, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  PlusCircle, 
  X, 
  Edit3, 
  Trash2,
  ListFilter,
  Check,
  FileText,
  AlignLeft,
  Image,
  Search
} from 'lucide-react';

export function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const { token } = useAuthStore();
  const { showToast } = useToast();
  
  // Dashboard Workspace state
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'catalog'
  
  // List States
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Products/Categories list states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Product Setup Form Modal States
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminSelectedCategoryFilter, setAdminSelectedCategoryFilter] = useState('all');

  const currentLang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Load and refresh core data
  const fetchDashboardData = useCallback(async (showIndicator = false) => {
    try {
      if (showIndicator) setLoading(true);
      const [ordersRes, catsRes, prodsRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/menu/categories`),
        fetch(`${apiUrl}/api/menu/products`)
      ]);

      if (!ordersRes.ok || !catsRes.ok || !prodsRes.ok) {
        throw new Error('Failed to retrieve dashboard data.');
      }

      const ordersData = await ordersRes.json();
      const catsData = await catsRes.json();
      const prodsData = await prodsRes.json();

      setOrders(ordersData);
      setCategories(catsData);
      setProducts(prodsData);
      
      if (catsData.length > 0 && !selectedCat) {
        setSelectedCat(catsData[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, apiUrl, selectedCat]);

  useEffect(() => {
    fetchDashboardData(true);

    // Setup SignalR Real-Time connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/order`, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.invoke('JoinAdminDashboard');
      })
      .catch(err => console.error('SignalR Admin Connect Error:', err));

    // Listen for new orders
    connection.on('ReceiveAdminOrderNotification', (newOrder) => {
      // Sound alert and toast notice
      showToast(`New Order placed by ${newOrder.customerName}! 🍕`, 'success');
      // Refresh dashboard in background to fetch detailed items
      fetchDashboardData(false);
    });

    // Listen for status changes by co-admins
    connection.on('ReceiveAdminStatusUpdate', (data) => {
      setOrders(prev => prev.map(order =>
        order.id === data.orderId ? { ...order, status: data.status } : order
      ));
    });

    return () => {
      if (connection) {
        connection.invoke('LeaveAdminDashboard')
          .then(() => connection.stop())
          .catch(err => console.error(err));
      }
    };
  }, [token, apiUrl, fetchDashboardData, showToast]);

  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status.');
      }

      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status: nextStatus } : order
      ));
      
      showToast(`Order #${orderId.substring(0, 8)} updated to ${nextStatus}!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!nameEn || !nameAr || !price || !imageUrl) return;

    try {
      const method = editingProductId ? 'PUT' : 'POST';
      const endpoint = editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products';

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: { en: nameEn, ar: nameAr },
          description: { en: descEn, ar: descAr },
          price: parseFloat(price),
          imageUrl,
          categoryId: selectedCat
        })
      });

      if (!response.ok) {
        throw new Error(editingProductId ? 'Could not update product.' : 'Could not add product.');
      }

      showToast(
        editingProductId ? `${nameEn} updated successfully! 🍕` : `${nameEn} added successfully! 🍕`, 
        'success'
      );
      
      // Close modal and reset fields
      setShowAddMenu(false);
      setEditingProductId(null);
      setNameEn('');
      setNameAr('');
      setDescEn('');
      setDescAr('');
      setPrice('');
      setImageUrl('');

      // Refresh list
      fetchDashboardData(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setNameEn(product.name.en || '');
    setNameAr(product.name.ar || '');
    setDescEn(product.description.en || '');
    setDescAr(product.description.ar || '');
    setPrice(product.price.toString());
    setImageUrl(product.imageUrl || '');
    setSelectedCat(product.categoryId || '');
    setShowAddMenu(true);
  };

  const handleDeleteProduct = async (productId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const response = await fetch(`${apiUrl}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Could not delete product.');
      }

      showToast(`${name} deleted successfully.`, 'info');
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Computation stats
  const totalSales = orders.reduce((sum, order) => order.status === 'Delivered' ? sum + order.totalAmount : sum, 0);
  const pendingOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight leading-none">
            {t('admin.panelTitle')}
          </h1>
          <p className="text-xs font-bold text-text-muted mt-2">
            Real-time fulfillment operational board
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProductId(null);
            setNameEn('');
            setNameAr('');
            setDescEn('');
            setDescAr('');
            setPrice('');
            setImageUrl('');
            setShowAddMenu(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-black text-xs rounded-2xl shadow-lg shadow-brand-primary/10 hover:shadow-brand-primary/20 active:scale-95 transition-all cursor-pointer select-none"
        >
          <PlusCircle size={14} />
          <span>{t('admin.addProduct')}</span>
        </button>
      </div>

      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Orders Count */}
        <div className="bg-bg-card rounded-[28px] border border-border-card/95 shadow-md p-6 flex items-center gap-4 hover:shadow-lg hover:border-brand-primary/20 transition-all duration-300">
          <div className="p-3.5 bg-brand-light text-brand-text rounded-2xl border border-brand-primary/10">
            <Clock size={26} />
          </div>
          <div>
            <span className="text-[10px] font-black text-text-main/80 uppercase tracking-widest">
              {t('admin.ordersCount')}
            </span>
            <h3 className="text-3xl font-black text-text-main tracking-tight mt-1 flex items-baseline gap-1.5">
              <span>{pendingOrdersCount}</span>
              <span className="text-[10px] text-text-muted font-bold tracking-normal uppercase">Active</span>
            </h3>
            <span className="block text-[10px] font-bold text-brand-primary mt-1">
              Total Orders: {orders.length}
            </span>
          </div>
        </div>

        {/* Sales Volume */}
        <div className="bg-bg-card rounded-[28px] border border-border-card/95 shadow-md p-6 flex items-center gap-4 hover:shadow-lg hover:border-emerald-500/20 transition-all duration-300">
          <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/10">
            <DollarSign size={26} />
          </div>
          <div>
            <span className="text-[10px] font-black text-text-main/80 uppercase tracking-widest">
              Sales Volume
            </span>
            <h3 className="text-3xl font-black text-text-main tracking-tight mt-1">
              ${totalSales.toFixed(2)}
            </h3>
            <span className="block text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-wider">
              Delivered Completed
            </span>
          </div>
        </div>

        {/* Global connection quality */}
        <div className="bg-bg-card rounded-[28px] border border-border-card/95 shadow-md p-6 flex items-center gap-4 hover:shadow-lg hover:border-emerald-500/20 transition-all duration-300">
          <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/10">
            <TrendingUp size={26} />
          </div>
          <div>
            <span className="text-[10px] font-black text-text-main/80 uppercase tracking-widest">
              Socket Connection
            </span>
            <h3 className="text-3xl font-black text-emerald-500 tracking-tight mt-1 flex items-center gap-2 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active</span>
            </h3>
            <span className="block text-[10px] font-bold text-text-muted mt-1 uppercase tracking-wider">
              Live Broadcast Channel
            </span>
          </div>
        </div>
      </div>

      {/* Sliding Workspace Tab Navigation */}
      <div className="flex border-b border-border-card">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          {t('admin.incomingOrders')}
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          {t('admin.catalogTitle')}
        </button>
      </div>

      {/* TAB CONTENT: Incoming Orders Feed */}
      {activeTab === 'orders' && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Section Header */}
          <div className="bg-bg-card rounded-3xl border border-border-card/95 shadow-sm px-6 py-4 flex justify-between items-center bg-bg-app/20 transition-all duration-300">
            <h2 className="text-[10px] font-black text-text-main tracking-widest uppercase">
              {t('admin.incomingOrders')}
            </h2>
            <span className="px-3.5 py-1 bg-brand-light text-brand-text font-black text-[10px] rounded-full border border-brand-primary/10">
              {pendingOrdersCount} Pending Action
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <svg className="animate-spin h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-xs font-bold text-red-500">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-bg-card rounded-3xl border border-border-card p-12 text-center text-xs font-semibold text-text-muted shadow-sm">
              No orders found in database feed.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const date = new Date(order.createdAt).toLocaleDateString(i18n.language, {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div 
                    key={order.id} 
                    className="bg-bg-card rounded-3xl border border-border-card/95 shadow-md p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-lg hover:border-brand-primary/20 transition-all duration-300 relative group"
                  >
                    
                    {/* Information */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-brand-primary uppercase tracking-wide">
                          #{order.id.substring(0, 8)}
                        </span>
                        <span className="text-sm font-bold text-text-main">
                          {order.customerName}
                        </span>
                        <span className="text-[10px] text-text-muted font-bold">
                          {date}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs font-bold text-text-muted">
                        <span>
                          Total: <span className="text-text-main font-black">${order.totalAmount.toFixed(2)}</span>
                        </span>
                        <span className="w-1 h-1 bg-border-card rounded-full self-center" />
                        <span>
                          Payment: <span className="text-text-main">{order.paymentMethod}</span>
                        </span>
                      </div>

                      {/* Display Meal Items List */}
                      {order.items && order.items.length > 0 && (
                        <div className="mt-3 bg-bg-app border border-border-card/85 p-4 rounded-2xl max-w-xl space-y-2">
                          <span className="block text-[9px] font-black text-text-main/80 uppercase tracking-widest border-b border-border-card pb-1.5">Ordered Items:</span>
                          {order.items.map((item, idx) => {
                            const name = item.productName[currentLang] || item.productName['en'] || 'Meal';
                            return (
                              <div key={idx} className="flex justify-between items-center text-xs font-semibold text-text-main">
                                <span>
                                  {name} <span className="text-text-muted font-bold">x{item.quantity}</span>
                                </span>
                                <span className="text-text-main font-bold">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Delivery Address Details */}
                      <div className="text-xs text-text-muted font-semibold space-y-1.5 mt-2 bg-bg-app/40 border border-border-card/60 p-4 rounded-2xl max-w-xl">
                        <div>
                          <span className="font-bold uppercase text-[9px] text-text-main/70 block mb-0.5">Deliver to:</span>{' '}
                          <span className="text-text-main font-medium">{order.deliveryAddress}</span>
                        </div>
                        {order.addressDetails && (
                          <div className="border-t border-border-card/50 pt-1.5">
                            <span className="font-bold uppercase text-[9px] text-text-main/70 block mb-0.5">Details / Landmark:</span>{' '}
                            <span className="text-text-main font-medium">{order.addressDetails}</span>
                          </div>
                        )}
                        {order.phoneNumber && (
                          <div className="border-t border-border-card/50 pt-1.5">
                            <span className="font-bold uppercase text-[9px] text-text-main/70 block mb-0.5">Phone Contact:</span>{' '}
                            <span className="text-text-main font-medium">{order.phoneNumber}</span>
                          </div>
                        )}
                        {order.notes && (
                          <div className="border-t border-border-card/50 pt-1.5">
                            <span className="font-bold uppercase text-[9px] text-brand-text block mb-0.5">Special Notes:</span>{' '}
                            <span className="text-brand-text font-black italic bg-brand-light/50 px-3 py-1 rounded-lg border border-brand-primary/10 inline-block mt-0.5">
                              {order.notes}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Controller Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0 self-start lg:self-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className={`px-4 py-2.5 border rounded-2xl text-xs font-black focus:outline-none transition-all cursor-pointer shadow-xs select-none ${
                          order.status === 'Pending'
                            ? 'border-amber-200 bg-amber-50 text-amber-600 focus:ring-amber-500/20 dark:bg-amber-950/20'
                            : order.status === 'Preparing'
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-600 focus:ring-indigo-500/20 dark:bg-indigo-950/20'
                            : order.status === 'OutForDelivery'
                            ? 'border-purple-200 bg-purple-50 text-purple-600 focus:ring-purple-500/20 dark:bg-purple-950/20'
                            : order.status === 'Delivered'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600 focus:ring-emerald-500/20 dark:bg-emerald-950/20'
                            : 'border-rose-200 bg-rose-50 text-rose-600 focus:ring-rose-500/20 dark:bg-rose-950/20'
                        }`}
                      >
                        <option value="Pending">Pending Approval</option>
                        <option value="Preparing">Preparing in Kitchen</option>
                        <option value="OutForDelivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Menu Products Catalog Management */}
      {activeTab === 'catalog' && (() => {
        const filteredProducts = products.filter(p => {
          if (!p) return false;
          const nameEn = p.name?.['en'] || '';
          const nameAr = p.name?.['ar'] || '';
          const descEn = p.description?.['en'] || '';
          const descAr = p.description?.['ar'] || '';
          const matchesSearch = nameEn.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                                nameAr.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                                descEn.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                                descAr.toLowerCase().includes(adminSearchQuery.toLowerCase());
          const matchesCategory = adminSelectedCategoryFilter === 'all' || p.categoryId === adminSelectedCategoryFilter;
          return matchesSearch && matchesCategory;
        });

        return (
          <div className="bg-bg-card rounded-[32px] border border-border-card shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="px-6 py-5 border-b border-border-card bg-bg-app/30 flex justify-between items-center">
              <h2 className="text-xs font-black text-text-main tracking-tight uppercase">
                {t('admin.catalogTitle')}
              </h2>
              <span className="text-[10px] font-black uppercase text-brand-text bg-brand-light px-2.5 py-1 rounded-full">
                {products.length} Items Listed
              </span>
            </div>

            {/* Dynamic Search & Category Filter Bar */}
            <div className="px-6 py-4 bg-bg-app/30 border-b border-border-card flex flex-col sm:flex-row gap-4 items-center justify-between transition-colors duration-300">
              {/* Search Input */}
              <div className="relative w-full sm:max-w-xs group">
                <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-brand-primary" size={15} />
                <input
                  type="text"
                  placeholder={t('admin.catalogSearchPlaceholder')}
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  className="w-full ps-10 pe-4 py-2 bg-bg-card border border-border-card rounded-xl text-xs text-text-main font-semibold placeholder:text-text-muted/65 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-xs text-start"
                />
                {adminSearchQuery && (
                  <button
                    onClick={() => setAdminSearchQuery('')}
                    className="absolute end-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main p-0.5 rounded-full hover:bg-bg-app transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category Select Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-wider hidden md:inline">{t('admin.tableCategory')}:</span>
                <select
                  value={adminSelectedCategoryFilter}
                  onChange={(e) => setAdminSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-bg-card border border-border-card rounded-xl text-xs text-text-main font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer shadow-xs select-none min-w-[140px]"
                >
                  <option value="all">{t('admin.filterAllCategories')}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name[currentLang] || c.name['en']}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-xs font-semibold text-text-muted">
                {t('admin.catalogNoMatch')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse">
                  <thead>
                    <tr className="border-b border-border-card text-[9px] font-black text-text-muted uppercase tracking-wider bg-bg-app/20">
                      <th className="px-6 py-3.5 text-start">{t('admin.tableProduct')}</th>
                      <th className="px-6 py-3.5 text-start">{t('admin.tableCategory')}</th>
                      <th className="px-6 py-3.5 text-start">{t('admin.tableDescription')}</th>
                      <th className="px-6 py-3.5 text-start">{t('admin.tablePrice')}</th>
                      <th className="px-6 py-3.5 text-end">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-card text-xs font-bold text-text-main">
                    {filteredProducts.map((prod) => {
                      if (!prod) return null;
                      const prodName = prod.name?.[currentLang] || prod.name?.['en'] || '';
                      const prodDesc = prod.description?.[currentLang] || prod.description?.['en'] || '';
                      
                      // Resolve localized category name
                      const cat = categories.find(c => c.id === prod.categoryId);
                      const catName = cat ? (cat.name[currentLang] || cat.name['en'] || '') : 'General';

                      return (
                        <tr key={prod.id} className="hover:bg-bg-app/10 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <img src={prod.imageUrl} alt={prodName} className="w-10 h-10 rounded-xl object-cover bg-bg-app flex-shrink-0" />
                            <div>
                              <span className="font-extrabold text-text-main block">{prodName}</span>
                              <span className="text-[10px] text-text-muted font-semibold">{prod.name?.ar || ''}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-brand-light text-brand-text font-black text-[9px] uppercase rounded-full border border-brand-primary/10">
                              {catName}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate text-text-muted font-medium">
                            {prodDesc}
                          </td>
                          <td className="px-6 py-4 font-black text-text-main">
                            ${prod.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-end">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditClick(prod)}
                                className="p-2 bg-brand-light text-brand-text rounded-xl hover:bg-brand-primary hover:text-white transition-colors cursor-pointer border border-brand-primary/10"
                                title="Edit item"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prodName)}
                                className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-colors cursor-pointer border border-red-200/30 dark:bg-red-950/20"
                                title="Delete item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* QUICK ADD/EDIT PRODUCT MODAL OVERLAY */}
      {showAddMenu && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setShowAddMenu(false)}
          />

          {/* Dialog Modal Card */}
          <form 
            onSubmit={handleAddProduct} 
            className="relative bg-bg-card/98 backdrop-blur-md w-full max-w-lg rounded-[32px] border border-border-card shadow-2xl p-8 flex flex-col gap-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-350 ease-out"
          >
            <div className="border-b border-border-card pb-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base text-text-main tracking-tight uppercase">
                {editingProductId ? `Edit Product: ${nameEn}` : 'Add New Menu Product'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMenu(false)}
                className="p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-bg-app transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-main/85 uppercase mb-1.5 tracking-wider">Product Name (EN)</label>
                <input 
                  type="text" 
                  required 
                  value={nameEn} 
                  onChange={e => setNameEn(e.target.value)} 
                  className="w-full px-4 py-3 bg-bg-app border border-border-card/90 rounded-2xl text-xs text-text-main font-semibold placeholder:text-text-muted/85 focus:outline-none focus:bg-bg-card focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200" 
                  placeholder="Pepperoni Pizza" 
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-text-main/85 uppercase mb-1.5 tracking-wider">Product Name (AR)</label>
                <input 
                  type="text" 
                  required 
                  value={nameAr} 
                  onChange={e => setNameAr(e.target.value)} 
                  dir="rtl"
                  className="w-full px-4 py-3 bg-bg-app border border-border-card/90 rounded-2xl text-xs text-text-main font-semibold placeholder:text-text-muted/85 focus:outline-none focus:bg-bg-card focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-start" 
                  placeholder="بيتزا بيبيروني" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-main/85 uppercase mb-1.5 tracking-wider">Description (EN)</label>
                <textarea 
                  rows="2"
                  value={descEn} 
                  onChange={e => setDescEn(e.target.value)} 
                  className="w-full px-4 py-3 bg-bg-app border border-border-card/90 rounded-2xl text-xs text-text-main font-semibold placeholder:text-text-muted/85 focus:outline-none focus:bg-bg-card focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 resize-none" 
                  placeholder="Tomato sauce, mozzarella cheese, and premium pepperoni." 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-main/85 uppercase mb-1.5 tracking-wider">Description (AR)</label>
                <textarea 
                  rows="2"
                  value={descAr} 
                  onChange={e => setDescAr(e.target.value)} 
                  dir="rtl"
                  className="w-full px-4 py-3 bg-bg-app border border-border-card/90 rounded-2xl text-xs text-text-main font-semibold placeholder:text-text-muted/85 focus:outline-none focus:bg-bg-card focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 text-start resize-none" 
                  placeholder="صلصة طماطم، جبنة موزاريلا، بيبيروني فاخر." 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-main/85 uppercase mb-1.5 tracking-wider">Price ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  className="w-full px-4 py-3 bg-bg-app border border-border-card/90 rounded-2xl text-xs text-text-main font-semibold placeholder:text-text-muted/85 focus:outline-none focus:bg-bg-card focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200" 
                  placeholder="12.99" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-main/85 uppercase mb-1.5 tracking-wider">Category</label>
                <select 
                  value={selectedCat} 
                  onChange={e => setSelectedCat(e.target.value)} 
                  className="w-full px-4 py-3 bg-bg-app border border-border-card/90 rounded-2xl text-xs text-text-main font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 cursor-pointer select-none"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name[currentLang] || c.name['en']}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-text-main/85 uppercase mb-1.5 tracking-wider">Image URL</label>
                <input 
                  type="text" 
                  required 
                  value={imageUrl} 
                  onChange={e => setImageUrl(e.target.value)} 
                  className="w-full px-4 py-3 bg-bg-app border border-border-card/90 rounded-2xl text-xs text-text-main font-semibold placeholder:text-text-muted/85 focus:outline-none focus:bg-bg-card focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200" 
                  placeholder="https://images.unsplash.com/... or source image URL" 
                />
              </div>

              {/* Dynamic Image Preview Box */}
              {imageUrl && imageUrl.trim().startsWith('http') && (
                <div className="sm:col-span-2 flex items-center gap-4 p-3 bg-bg-app/30 border border-border-card/60 rounded-2xl animate-in fade-in duration-200">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-14 h-14 rounded-xl object-cover bg-bg-app flex-shrink-0 border border-border-card"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="min-w-0">
                    <span className="block text-[8px] font-black text-brand-primary uppercase tracking-widest">Image Preview</span>
                    <span className="text-[10px] text-text-muted truncate block max-w-[280px]">{imageUrl}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="border-t border-border-card pt-4 flex justify-end gap-3 mt-2">
              <button 
                type="button"
                onClick={() => setShowAddMenu(false)}
                className="px-5 py-3 bg-bg-app hover:bg-border-card text-text-main font-bold text-xs rounded-xl transition-all cursor-pointer border border-border-card select-none"
              >
                Close
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-black text-xs rounded-xl shadow-md shadow-brand-primary/10 hover:shadow-brand-primary/20 active:scale-95 transition-all cursor-pointer select-none"
              >
                {editingProductId ? 'Save Changes' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
