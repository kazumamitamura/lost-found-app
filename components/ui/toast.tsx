"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, showToast, removeToast };
}

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, 3000);
      return () => clearTimeout(timer);
    });
  }, [toasts, onRemove]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg shadow-lg min-w-[300px] max-w-md animate-in slide-in-from-right",
            {
              "bg-green-50 border border-green-200 text-green-800": toast.type === "success",
              "bg-red-50 border border-red-200 text-red-800": toast.type === "error",
              "bg-blue-50 border border-blue-200 text-blue-800": toast.type === "info",
              "bg-amber-50 border border-amber-200 text-amber-800": toast.type === "warning",
            }
          )}
        >
          <div className="flex-1">
            <p className="font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
