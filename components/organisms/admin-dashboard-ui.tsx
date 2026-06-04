import type { ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";

export function StatusBadge({ status }: { status: "pending" | "shipped" | "delivered" }) {
  const labels = {
    pending: "قيد المتابعة",
    shipped: "تم الشحن",
    delivered: "تم التسليم"
  };

  return <Badge>{labels[status]}</Badge>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-rawey-line bg-white p-6 text-center text-sm text-rawey-muted">
      {children}
    </div>
  );
}

export function shortId(id: string) {
  return id.slice(0, 8);
}
