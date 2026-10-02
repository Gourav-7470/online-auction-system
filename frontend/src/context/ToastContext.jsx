import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Gavel, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, options = {}) => {
    const id = ++idCounter;
    const duration = options.duration ?? (type === 'bid' ? 6000 : 4000);

    const newToast = {
      id,
      type,
      message,
      title: options.title,
      amount: options.amount,
      bidder: options.bidder,
    };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, opts) => addToast('success', msg, opts),
    error: (msg, opts) => addToast('error', msg, opts),
    info: (msg, opts) => addToast('info', msg, opts),
    warning: (msg, opts) => addToast('warning', msg, opts),
    bid: (opts) => addToast('bid', opts.message || 'New live bid placed!', opts),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          let bg = 'bg-white border-slate-200 text-slate-800';
          let icon = <Info className="w-5 h-5 text-indigo-500 shrink-0" />;

          if (t.type === 'success') {
            bg = 'bg-emerald-50 border-emerald-200 text-emerald-900';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
          } else if (t.type === 'error') {
            bg = 'bg-rose-50 border-rose-200 text-rose-900';
            icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
          } else if (t.type === 'warning') {
            bg = 'bg-amber-50 border-amber-200 text-amber-900';
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
          } else if (t.type === 'bid') {
            bg = 'bg-indigo-900 border-indigo-700 text-white shadow-indigo-900/30';
            icon = <Gavel className="w-5 h-5 text-gold-400 shrink-0 animate-bounce" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all transform animate-slide-up ${bg}`}
              role="alert"
            >
              {icon}
              <div className="flex-1 min-w-0">
                {t.type === 'bid' ? (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                        Live Bid Alert
                      </span>
                      {t.amount && (
                        <span className="text-sm font-extrabold text-white bg-indigo-800/80 px-2 py-0.5 rounded-full">
                          {formatCurrency(t.amount)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium mt-1 truncate">
                      {t.title || t.message}
                    </p>
                    {t.bidder && (
                      <p className="text-xs text-indigo-200 mt-0.5">
                        Bidder: <span className="font-semibold text-white">{t.bidder}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    {t.title && <h4 className="text-sm font-semibold mb-0.5">{t.title}</h4>}
                    <p className="text-sm font-medium">{t.message}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 transition-colors rounded-lg"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
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
