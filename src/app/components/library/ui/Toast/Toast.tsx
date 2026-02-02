import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import './Toast.css';

// ============================================================================
// Types
// ============================================================================
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
  duration?: number;
  exiting?: boolean;
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ============================================================================
// Context
// ============================================================================
const ToastContext = createContext<ToastContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const hideToast = useCallback((id: string) => {
    // Mark as exiting for animation
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));

    // Remove after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 200);

    // Clear timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = toast.duration ?? 5000;

    setToasts(prev => [...prev, { ...toast, id }]);

    // Auto-hide after duration
    if (duration > 0) {
      const timer = setTimeout(() => hideToast(id), duration);
      timersRef.current.set(id, timer);
    }
  }, [hideToast]);

  const success = useCallback((title: string, message?: string) => {
    showToast({ title, message, variant: 'success' });
  }, [showToast]);

  const error = useCallback((title: string, message?: string) => {
    showToast({ title, message, variant: 'error', duration: 8000 });
  }, [showToast]);

  const warning = useCallback((title: string, message?: string) => {
    showToast({ title, message, variant: 'warning' });
  }, [showToast]);

  const info = useCallback((title: string, message?: string) => {
    showToast({ title, message, variant: 'info' });
  }, [showToast]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

// ============================================================================
// Toast Container
// ============================================================================
interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="ui-toast-container">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

// ============================================================================
// Toast Item
// ============================================================================
interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const icons: Record<ToastVariant, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const classes = [
    'ui-toast',
    `ui-toast--${toast.variant}`,
    toast.exiting && 'ui-toast--exiting',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} role="alert">
      <span className="ui-toast__icon">{icons[toast.variant]}</span>
      <div className="ui-toast__content">
        <div className="ui-toast__title">{toast.title}</div>
        {toast.message && <div className="ui-toast__message">{toast.message}</div>}
      </div>
      <button className="ui-toast__close" onClick={() => onClose(toast.id)}>×</button>
    </div>
  );
};

// ============================================================================
// Hook
// ============================================================================
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
