import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('cart'));
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && item.product && typeof item.product.id !== 'undefined');
      }
    } catch (e) {
      console.error('Failed to parse cart from localStorage:', e);
    }
    return [];
  })(),
  
  addItem: (product) => {
    const currentItems = get().items;
    const existing = currentItems.find(item => item.product.id === product.id);
    
    let updatedItems;
    if (existing) {
      updatedItems = currentItems.map(item =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedItems = [...currentItems, { product, quantity: 1 }];
    }
    
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    set({ items: updatedItems });
  },
  
  removeItem: (productId) => {
    const currentItems = get().items;
    const existing = currentItems.find(item => item.product.id === productId);
    
    if (!existing) return;
    
    let updatedItems;
    if (existing.quantity === 1) {
      updatedItems = currentItems.filter(item => item.product.id !== productId);
    } else {
      updatedItems = currentItems.map(item =>
        item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    }
    
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    set({ items: updatedItems });
  },
  
  clearCart: () => {
    localStorage.removeItem('cart');
    set({ items: [] });
  },
  
  getTotalAmount: () => {
    return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }
}));
