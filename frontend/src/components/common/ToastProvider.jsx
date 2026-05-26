import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Floating Toast Container */}
      <div 
        className={`fixed z-50 flex flex-col gap-3 max-w-sm w-full p-4 pointer-events-none transition-all duration-300 ${
          isRtl 
            ? 'left-0 sm:left-4 bottom-16 sm:bottom-4' 
            : 'right-0 sm:right-4 bottom-16 sm:bottom-4'
        }`}
      >
        {toasts.map((toast) => {
          let Icon = Info;
          let iconColor = 'text-blue-500';
          let borderColor = 'border-slate-100 dark:border-slate-800';
          let glowColor = 'shadow-slate-500/5';

          switch (toast.type) {
            case 'success':
              Icon = CheckCircle;
              iconColor = 'text-emerald-500';
              borderColor = 'border-emerald-100';
              glowColor = 'shadow-emerald-500/10';
              break;
            case 'error':
              Icon = AlertCircle;
              iconColor = 'text-red-500';
              borderColor = 'border-red-100';
              glowColor = 'shadow-red-500/10';
              break;
            case 'warning':
              Icon = AlertTriangle;
              iconColor = 'text-amber-500';
              borderColor = 'border-amber-100';
              glowColor = 'shadow-amber-500/10';
              break;
            default:
              Icon = Info;
              iconColor = 'text-brand-primary';
              borderColor = 'border-brand-light';
              glowColor = 'shadow-brand-primary/10';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 bg-bg-card text-text-main border rounded-2xl shadow-xl ${borderColor} ${glowColor} animate-in fade-in slide-in-from-bottom-4 duration-300`}
              role="alert"
            >
              <div className="flex items-center gap-3">
                <Icon className={`${iconColor} flex-shrink-0`} size={18} />
                <span className="text-xs font-bold leading-relaxed">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-full text-text-muted hover:text-text-main hover:bg-bg-app transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
