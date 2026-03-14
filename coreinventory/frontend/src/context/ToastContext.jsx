import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const success = (message) => addToast(message, 'success');
  const error = (message) => addToast(message, 'error');
  const warning = (message) => addToast(message, 'warning');

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ success, error, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 min-w-[300px] px-4 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 translate-y-0 opacity-100 ease-out animate-slideIn ${
              toast.type === 'success' ? 'bg-[#10B981]' :
              toast.type === 'error' ? 'bg-[#EF4444]' :
              toast.type === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#6366F1]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5" />}
            <span className="flex-1 font-medium">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="opacity-80 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
