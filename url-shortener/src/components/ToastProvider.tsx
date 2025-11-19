// src/components/ToastProvider.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  title?: string;
  message: ReactNode;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: ReactNode) => void;
  success: (title: string, message?: ReactNode) => void;
  error: (title: string, message?: ReactNode) => void;
  info: (title: string, message?: ReactNode) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: ToastType, title: string, message?: ReactNode) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const toast = (type: ToastType, title: string, message?: ReactNode) =>
    addToast(type, title, message);
  const success = (title: string, message?: ReactNode) => addToast("success", title, message);
  const error = (title: string, message?: ReactNode) => addToast("error", title, message);
  const info = (title: string, message?: ReactNode) => addToast("info", title, message);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 max-w-sm rounded-lg shadow-lg p-4 text-white animate-in slide-in-from-top-5 fade-in duration-300 ${
              t.type === "success"
                ? "bg-green-600"
                : t.type === "error"
                ? "bg-red-600"
                : "bg-blue-600"
            }`}
          >
            {t.type === "success" && <CheckCircle className="w-6 h-6 flex-shrink-0" />}
            {t.type === "error" && <XCircle className="w-6 h-6 flex-shrink-0" />}
            {t.type === "info" && <div className="w-6 h-6 rounded-full bg-white/30 flex-shrink-0" />}

            <div className="flex-1">
              <div className="font-semibold">{t.title}</div>
              {t.message && <div className="text-sm opacity-90 mt-1">{t.message}</div>}
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="opacity-70 hover:opacity-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};