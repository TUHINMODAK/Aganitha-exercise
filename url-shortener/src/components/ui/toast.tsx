"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  type: ToastType;
  message: ReactNode;
}

interface ToastContextType {
  showToast: (type: ToastType, message: ReactNode) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, message: ReactNode) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 p-3 rounded-lg shadow-md text-white animate-slide-in ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.type === "success" && <CheckCircle />}
            {toast.type === "error" && <AlertCircle />}
            <div className="flex-1">{toast.message}</div>
            <X
              className="cursor-pointer"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            />
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
