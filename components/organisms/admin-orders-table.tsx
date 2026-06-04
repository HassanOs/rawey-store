"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Select } from "@/components/atoms/select";
import { EmptyState, shortId, StatusBadge } from "@/components/organisms/admin-dashboard-ui";
import { getProductSizeLabel } from "@/lib/product-variants";
import { formatDate, formatPrice } from "@/lib/utils";
import { updateOrderStatus } from "@/app/admin/actions";
import type { OrderWithItems } from "@/types/database";

const paymentLabels = {
  COD: "عند الاستلام",
  WISH: "Wish"
};

export function OrdersTable({ orders }: { orders: OrderWithItems[] }) {
  if (!orders.length) {
    return <EmptyState>لا توجد طلبات في هذا العرض.</EmptyState>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rawey-line bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div className="grid min-w-[760px] grid-cols-[110px_minmax(150px,1fr)_120px_110px_130px_40px] gap-3 border-b border-rawey-line px-4 py-3 text-xs font-bold text-rawey-muted">
          <span>ID</span>
          <span>العميل</span>
          <span>الحالة</span>
          <span>التاريخ</span>
          <span>الإجمالي</span>
          <span />
        </div>
        <div className="divide-y divide-rawey-line">
          {orders.map((order) => (
            <details key={order.id} className="group">
              <summary className="grid min-w-[760px] cursor-pointer grid-cols-[110px_minmax(150px,1fr)_120px_110px_130px_40px] items-center gap-3 px-4 py-3 text-sm transition hover:bg-rawey-background">
              <span className="font-semibold">#{shortId(order.id)}</span>
              <span className="truncate">
                <span className="block font-semibold">{order.full_name || "بدون اسم"}</span>
                <span className="text-xs text-rawey-muted">{order.phone_number}</span>
              </span>
              <StatusBadge status={order.status} />
              <span className="text-rawey-muted">{formatDate(order.created_at)}</span>
              <span className="font-semibold">{formatPrice(order.total_price)}</span>
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <div className="grid gap-4 bg-rawey-background/70 p-4 text-sm lg:grid-cols-[1fr_260px]">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={order.status} />
                  <span className="text-rawey-muted">{paymentLabels[order.payment_method]}</span>
                  <span className="text-rawey-muted">توصيل {formatPrice(order.shipping_price)}</span>
                </div>
                <p className="text-rawey-muted">
                  {[order.governorate, order.district_city, order.address_details, order.landmark].filter(Boolean).join(" - ")}
                </p>
                <div className="rounded-xl bg-white p-3">
                  {order.items.map((item) => (
                    <p key={item.id} className="flex flex-wrap justify-between gap-2">
                      <span>{item.product?.name || "منتج"} - {item.variant ? getProductSizeLabel(item.variant.size_ml) : "-"}</span>
                      <span className="font-semibold">x {item.quantity}</span>
                    </p>
                  ))}
                </div>
              </div>
              <form action={updateOrderStatus.bind(null, order.id)} className="space-y-2">
                <Select name="status" defaultValue={order.status}>
                  <option value="pending">قيد المتابعة</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التسليم</option>
                </Select>
                <Button type="submit" variant="secondary" className="w-full">تحديث</Button>
              </form>
            </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
