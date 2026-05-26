import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import * as signalR from '@microsoft/signalr';
import { ShieldCheck, Truck, Package, Utensils, CheckCircle, TrendingUp, DollarSign, Clock, PlusCircle } from 'lucide-react';

export function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const { token } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick seed menu form state (so engineers can easily add items in English & Arabic!)
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');

  const currentLang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // 1. Fetch initial orders, categories, and products list
    const fetchOrders = async () => {
      try {
        setLoading(true);
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
        if (catsData.length > 0) {
          setSelectedCat(catsData[0].id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // 2. Setup SignalR Real-Time socket connection for incoming admin dashboard alerts
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

    // Listen for new orders placed by customers
    connection.on('ReceiveAdminOrderNotification', (newOrder) => {
      // Prepend the new order to active feed immediately!
      setOrders(prev => [
        {
          id: newOrder.orderId,
          customerName: newOrder.customerName,
          totalAmount: newOrder.totalAmount,
          status: newOrder.status,
          createdAt: newOrder.createdAt,
          items: [] // fetch full details if clicked, or just show summary in real-time
        },
        ...prev
      ]);
    });

    // Listen for status changes (e.g. if another admin updates an order)
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
  }, [token, apiUrl]);

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

      // Update state locally
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status: nextStatus } : order
      ));
    } catch (err) {
      alert(err.message);
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

      alert(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
      
      // Reset form states
      setShowAddMenu(false);
      setEditingProductId(null);
      setNameEn('');
      setNameAr('');
      setDescEn('');
      setDescAr('');
      setPrice('');
      setImageUrl('');

      // Refresh catalog list
      const prodsRes = await fetch(`${apiUrl}/api/menu/products`);
      const prodsData = await prodsRes.json();
      setProducts(prodsData);
    } catch (err) {
      alert(err.message);
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
    
    // Smooth scroll up to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

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

      alert('Product deleted successfully!');
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      alert(err.message);
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
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
            {t('admin.panelTitle')}
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-2">
            Real-time fulfillment operational board
          </p>
        </div>

        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-amber-500/10 active:scale-95 transition-all"
        >
          <PlusCircle size={15} />
          <span>{showAddMenu ? 'Hide Setup Form' : 'Quick Add Product'}</span>
        </button>
      </div>

      {/* Quick Add Product Form Overlay panel */}
      {showAddMenu && (
        <form onSubmit={handleAddProduct} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="sm:col-span-2 border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
              {editingProductId ? `Edit Product: ${nameEn}` : 'Add New Menu Product'}
            </h3>
            {editingProductId && (
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setNameEn('');
                  setNameAr('');
                  setDescEn('');
                  setDescAr('');
                  setPrice('');
                  setImageUrl('');
                  setShowAddMenu(false);
                }}
                className="text-[10px] font-black text-red-500 hover:underline uppercase cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Product Name (EN)</label>
            <input type="text" required value={nameEn} onChange={e => setNameEn(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none" placeholder="Cheeseburger" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Product Name (AR)</label>
            <input type="text" required value={nameAr} onChange={e => setNameAr(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold text-end focus:outline-none" placeholder="تشيز برجر" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Description (EN)</label>
            <input type="text" value={descEn} onChange={e => setDescEn(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none" placeholder="Juicy patties..." />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Description (AR)</label>
            <input type="text" value={descAr} onChange={e => setDescAr(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold text-end focus:outline-none" placeholder="شريحة لحم شهية..." />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Price ($)</label>
            <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none" placeholder="7.99" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Category</label>
            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none">
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name[currentLang] || c.name['en']}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Image URL</label>
            <input type="text" required value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none" placeholder="https://images.unsplash.com/... or Unsplash source URL" />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/10 active:scale-95 transition-all cursor-pointer">
              {editingProductId ? 'Save Changes' : 'Save Product'}
            </button>
          </div>
        </form>
      )}

      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Orders Count */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              {t('admin.ordersCount')}
            </span>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-1">
              {pendingOrdersCount}
            </h3>
          </div>
        </div>

        {/* Sales Volume */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-500 rounded-2xl">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Sales Volume (Delivered)
            </span>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-1">
              ${totalSales.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Global connection quality */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Live Socket Bridge
            </span>
            <h3 className="text-2xl font-black text-emerald-500 tracking-tight leading-none mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Active</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Main Order Feed Panel */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-black text-slate-800 tracking-tight">
            {t('admin.incomingOrders')}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs font-bold text-red-500">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400">
            No orders found in database feed.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/30 transition-colors">
                
                {/* Information */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-amber-500 uppercase">
                      #{order.id.substring(0, 8)}
                    </span>
                    <span className="text-xs font-extrabold text-slate-700">
                      {order.customerName}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                    <span>
                      Total: <span className="text-slate-700">${order.totalAmount.toFixed(2)}</span>
                    </span>
                    <span>
                      Payment: <span className="text-slate-600">{order.paymentMethod}</span>
                    </span>
                    <span>
                      Status: <span className="text-amber-500">{t(`status.${order.status}`)}</span>
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold leading-none">
                    Deliver to: {order.deliveryAddress}
                  </div>
                </div>

                {/* Status Controller Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="Pending">Pending Approval</option>
                    <option value="Preparing">Preparing in Kitchen</option>
                    <option value="OutForDelivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menu Products Catalog Panel */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-base font-black text-slate-800 tracking-tight">
            Menu Catalog Management
          </h2>
          <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
            {products.length} Items Listed
          </span>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400">
            No catalog products found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wide bg-slate-50/20">
                  <th className="px-6 py-3 text-start">Product</th>
                  <th className="px-6 py-3 text-start">Description</th>
                  <th className="px-6 py-3 text-start">Price</th>
                  <th className="px-6 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-600">
                {products.map((prod) => {
                  const prodName = prod.name[currentLang] || prod.name['en'] || '';
                  const prodDesc = prod.description[currentLang] || prod.description['en'] || '';
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={prod.imageUrl} alt={prodName} className="w-10 h-10 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                        <div>
                          <span className="font-extrabold text-slate-800 block">{prodName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{prod.name.ar}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-400 leading-normal">
                        {prodDesc}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-800">
                        ${prod.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-end">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(prod)}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-600 rounded-lg transition-colors border border-amber-200/30 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-lg transition-colors border border-red-200/30 cursor-pointer"
                          >
                            Delete
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
    </div>
  );
}
