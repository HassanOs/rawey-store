"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type ToastInput = {
  title: string;
  description?: string;
  actions?: ToastAction[];
};

type Toast = ToastInput & {
  id: string;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((current) => [{ ...toast, id }, ...current].slice(0, 3));
      window.setTimeout(() => dismissToast(id), 5200);
    },
    [dismissToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[80] flex w-[min(100%-2rem,420px)] flex-col gap-3" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div key={toast.id} className="rounded-2xl border border-rawey-line bg-white p-4 text-right shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-rawey-text">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm leading-6 text-rawey-muted">{toast.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-rawey-muted transition hover:bg-rawey-background hover:text-rawey-text"
                aria-label="إغلاق التنبيه"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {toast.actions?.length ? (
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                {toast.actions.map((action) =>
                  action.href ? (
                    <Link
                      key={action.label}
                      href={action.href}
                      onClick={() => dismissToast(toast.id)}
                      className="rounded-full bg-rawey-text px-3 py-2 text-xs font-semibold text-white transition hover:bg-rawey-gold hover:text-rawey-text"
                    >
                      {action.label}
                    </Link>
                  ) : (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => {
                        action.onClick?.();
                        dismissToast(toast.id);
                      }}
                      className="rounded-full border border-rawey-line px-3 py-2 text-xs font-semibold text-rawey-text transition hover:border-rawey-gold hover:text-rawey-gold"
                    >
                      {action.label}
                    </button>
                  )
                )}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}
