"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    // Auto-dismiss after 4 seconds
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slide-up
              ${t.type === "success" ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/40 dark:border-green-800 dark:text-green-200" : ""}
              ${t.type === "error" ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-800 dark:text-red-200" : ""}
              ${t.type === "info" ? "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-200" : ""}
            `}
          >
            <span>
              {t.type === "success" && "✓"}
              {t.type === "error" && "✕"}
              {t.type === "info" && "ℹ"}
            </span>
            <span>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
