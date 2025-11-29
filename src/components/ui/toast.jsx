import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ title, description, type = 'default', duration = 3000 }) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, title, description, type, duration }]);

        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
              pointer-events-auto
              flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-md
              transform transition-all duration-300 animate-fade-in
              ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : ''}
              ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : ''}
              ${toast.type === 'default' ? 'bg-card/80 border-border text-foreground' : ''}
            `}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                        {toast.type === 'default' && <Info className="w-5 h-5 mt-0.5 shrink-0" />}

                        <div className="flex-1">
                            {toast.title && <h3 className="font-semibold text-sm">{toast.title}</h3>}
                            {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
                        </div>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="opacity-70 hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
