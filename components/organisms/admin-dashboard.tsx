"use client";

import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  ClipboardList,
  LogOut,
  PackagePlus,
  Search,
  Settings,
  ShoppingBag,
  Trash2,
  Truck,
  X
} from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Select } from "@/components/atoms/select";
import { AdminProductForm } from "@/components/organisms/admin-product-form";
import { formatPrice } from "@/lib/utils";
import type { OrderWithItems, ProductWithVariants } from "@/types/database";
import {
  createProduct,
  deleteProduct,
  deleteProducts,
  logoutAdmin,
  updateOrderStatus,
  updateProduct,
  updateShippingPrice
} from "@/app/admin/actions";

type AdminDashboardProps = {
  products: ProductWithVariants[];
  orders: OrderWithItems[];
  stats: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    deliveredOrders: number;
  };
  shippingPrice: number;
};

type OrderTab = "pending" | "delivered";

export function AdminDashboard({ products, orders, stats, shippingPrice }: AdminDashboardProps) {
  const [orderTab, setOrderTab] = useState<OrderTab>("pending");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("all");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const activeOrders = stats.totalOrders - stats.deliveredOrders;
  const averageOrder = stats.totalOrders ? stats.totalRevenue / stats.totalOrders : 0;
  const recentActivity = orders.slice(0, 5);
  const brands = useMemo(() => Array.from(new Set(products.map((product) => product.brand))).sort(), [products]);
  const visibleOrders = orders.filter((order) => (orderTab === "pending" ? order.status !== "delivered" : order.status === "delivered"));
  const filteredProducts = products.filter((product) => {
    const searchValue = search.trim().toLowerCase();
    const matchesSearch = !searchValue || `${product.name} ${product.brand}`.toLowerCase().includes(searchValue);
    const matchesBrand = brand === "all" || product.brand === brand;
    return matchesSearch && matchesBrand;
  });
  const allVisibleSelected = filteredProducts.length > 0 && filteredProducts.every((product) => selectedProductIds.includes(product.id));

  function toggleProduct(productId: string) {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  }

  function toggleVisibleProducts() {
    setSelectedProductIds((current) => {
      const visibleIds = filteredProducts.map((product) => product.id);
      if (visibleIds.every((id) => current.includes(id))) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6 lg:px-8">
      <aside className="lg:fixed lg:bottom-6 lg:top-24 lg:w-[260px]">
        <div className="flex max-h-full flex-col rounded-2xl border border-rawey-line bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-rawey-line pb-4">
            <Image src="/images/logo.svg" alt="Rawey Logo" width={48} height={48} />
            <div>
              <p className="text-xs font-semibold text-rawey-muted">Rawey</p>
              <h1 className="text-lg font-bold">لوحة الإدارة</h1>
            </div>
          </div>

          <nav className="mt-4 space-y-1 text-sm font-semibold">
            <SidebarLink href="#overview" icon={<BarChart3 className="h-4 w-4" />}>
              نظرة عامة
            </SidebarLink>
            <SidebarLink href="#orders" icon={<ClipboardList className="h-4 w-4" />}>
              الطلبات
            </SidebarLink>
            <SidebarLink href="#inventory" icon={<Boxes className="h-4 w-4" />}>
              المخزون
            </SidebarLink>
          </nav>

          <form action={logoutAdmin} className="mt-5 border-t border-rawey-line pt-4">
            <Button variant="secondary" className="w-full">
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </form>
        </div>
      </aside>

      <div className="mt-6 space-y-8 lg:col-start-2 lg:mt-0 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
        <section id="overview" className="scroll-mt-24 space-y-4">
          <SectionTitle
            eyebrow="Overview"
            title="نظرة عامة"
            description="مؤشرات مختصرة عن المبيعات والطلبات والمخزون."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={<ShoppingBag className="h-4 w-4" />} label="إجمالي الطلبات" value={String(stats.totalOrders)} />
            <Stat icon={<Truck className="h-4 w-4" />} label="طلبات نشطة" value={String(activeOrders)} />
            <Stat icon={<BarChart3 className="h-4 w-4" />} label="الإيراد" value={formatPrice(stats.totalRevenue)} />
            <Stat icon={<Boxes className="h-4 w-4" />} label="المنتجات" value={String(products.length)} note={`متوسط ${formatPrice(averageOrder)}`} />
          </div>
          <div className="rounded-2xl border border-rawey-line bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold">Recent Activity</h3>
            <div className="mt-3 divide-y divide-rawey-line">
              {recentActivity.length ? recentActivity.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div>
                    <p className="font-semibold">{order.full_name || "طلب بدون اسم"}</p>
                    <p className="text-xs text-rawey-muted">#{shortId(order.id)} - {new Date(order.created_at).toLocaleDateString("ar-LB")}</p>
                  </div>
                  <div className="text-left">
                    <StatusBadge status={order.status} />
                    <p className="mt-1 text-xs font-semibold">{formatPrice(order.total_price)}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-rawey-muted">لا يوجد نشاط حديث.</p>}
            </div>
          </div>
        </section>

        <section id="orders" className="scroll-mt-24 space-y-4">
          <SectionTitle
            icon={<ClipboardList className="h-5 w-5" />}
            title="الطلبات"
            description={`${stats.pendingOrders} قيد المتابعة، ${stats.deliveredOrders} تم تسليمه.`}
          />
          <div className="inline-flex rounded-full border border-rawey-line bg-white p-1 text-sm font-semibold shadow-sm">
            <button type="button" onClick={() => setOrderTab("pending")} className={tabClass(orderTab === "pending")}>
              Pending
            </button>
            <button type="button" onClick={() => setOrderTab("delivered")} className={tabClass(orderTab === "delivered")}>
              Delivered
            </button>
          </div>
          <OrdersTable orders={visibleOrders} />
        </section>

        <section id="inventory" className="scroll-mt-24 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionTitle
              icon={<Boxes className="h-5 w-5" />}
              title="المخزون"
              description="إدارة المنتجات والأحجام والأسعار."
            />
            <Button type="button" onClick={() => setIsAddOpen(true)}>
              <PackagePlus className="h-4 w-4" />
              إضافة منتج
            </Button>
          </div>

          <div className="rounded-2xl border border-rawey-line bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
              <label className="relative">
                <Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-rawey-muted" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="بحث عن منتج أو علامة" className="pr-10" />
              </label>
              <Select value={brand} onChange={(event) => setBrand(event.target.value)}>
                <option value="all">كل العلامات</option>
                {brands.map((brandName) => <option key={brandName} value={brandName}>{brandName}</option>)}
              </Select>
              <form action={deleteProducts} className="flex gap-2">
                {selectedProductIds.map((id) => <input key={id} type="hidden" name="product_id" value={id} />)}
                <Button type="submit" variant="danger" disabled={!selectedProductIds.length}>
                  <Trash2 className="h-4 w-4" />
                  حذف المحدد
                </Button>
              </form>
            </div>

            <form action={updateShippingPrice} className="mt-4 flex flex-col gap-2 border-t border-rawey-line pt-4 sm:flex-row sm:items-end">
              <label className="flex-1">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold">
                  <Settings className="h-4 w-4 text-rawey-gold" />
                  سعر التوصيل
                </span>
                <Input name="shipping_price" type="number" min="0" step="0.01" defaultValue={shippingPrice} required />
              </label>
              <Button type="submit" variant="secondary">حفظ</Button>
            </form>
          </div>

          <InventoryTable
            products={filteredProducts}
            selectedProductIds={selectedProductIds}
            allVisibleSelected={allVisibleSelected}
            onToggleProduct={toggleProduct}
            onToggleVisibleProducts={toggleVisibleProducts}
          />
        </section>
      </div>

      {isAddOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="mr-auto h-full w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">إضافة منتج</h2>
              <Button type="button" variant="ghost" size="icon" onClick={() => setIsAddOpen(false)} aria-label="إغلاق">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <AdminProductForm action={createProduct} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function OrdersTable({ orders }: { orders: OrderWithItems[] }) {
  if (!orders.length) {
    return <EmptyState>لا توجد طلبات في هذا العرض.</EmptyState>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rawey-line bg-white shadow-sm">
      <div className="grid grid-cols-[1fr_1fr_120px_40px] gap-3 border-b border-rawey-line px-4 py-3 text-xs font-bold text-rawey-muted">
        <span>ID</span>
        <span>Name</span>
        <span>Total</span>
        <span />
      </div>
      <div className="divide-y divide-rawey-line">
        {orders.map((order) => (
          <details key={order.id} className="group">
            <summary className="grid cursor-pointer grid-cols-[1fr_1fr_120px_40px] items-center gap-3 px-4 py-3 text-sm transition hover:bg-rawey-background">
              <span className="font-semibold">#{shortId(order.id)}</span>
              <span className="truncate">{order.full_name || "بدون اسم"}</span>
              <span className="font-semibold">{formatPrice(order.total_price)}</span>
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <div className="grid gap-4 bg-rawey-background/70 p-4 text-sm lg:grid-cols-[1fr_260px]">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={order.status} />
                  <span className="text-rawey-muted">{order.phone_number}</span>
                </div>
                <p className="text-rawey-muted">
                  {[order.governorate, order.district_city, order.address_details, order.landmark].filter(Boolean).join(" - ")}
                </p>
                <div className="rounded-xl bg-white p-3">
                  {order.items.map((item) => (
                    <p key={item.id}>
                      {item.product?.name || "منتج"} - {item.variant?.size_ml || "-"}ml x {item.quantity}
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
  );
}

function InventoryTable({
  products,
  selectedProductIds,
  allVisibleSelected,
  onToggleProduct,
  onToggleVisibleProducts
}: {
  products: ProductWithVariants[];
  selectedProductIds: string[];
  allVisibleSelected: boolean;
  onToggleProduct: (productId: string) => void;
  onToggleVisibleProducts: () => void;
}) {
  if (!products.length) {
    return <EmptyState>لا توجد منتجات مطابقة.</EmptyState>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rawey-line bg-white shadow-sm">
      <div className="grid grid-cols-[36px_1fr_120px_40px] gap-3 border-b border-rawey-line px-4 py-3 text-xs font-bold text-rawey-muted">
        <input type="checkbox" checked={allVisibleSelected} onChange={onToggleVisibleProducts} aria-label="تحديد كل المنتجات الظاهرة" />
        <span>Product</span>
        <span>Brand</span>
        <span />
      </div>
      <div className="divide-y divide-rawey-line">
        {products.map((product) => (
          <details key={product.id} className="group">
            <summary className="grid cursor-pointer grid-cols-[36px_1fr_120px_40px] items-center gap-3 px-4 py-3 text-sm transition hover:bg-rawey-background">
              <input
                type="checkbox"
                checked={selectedProductIds.includes(product.id)}
                onChange={() => onToggleProduct(product.id)}
                onClick={(event) => event.stopPropagation()}
                aria-label={`تحديد ${product.name}`}
              />
              <span className="truncate font-semibold">{product.name}</span>
              <span className="truncate text-rawey-muted">{product.brand}</span>
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <div className="space-y-3 bg-rawey-background/70 p-4">
              <AdminProductForm product={product} action={updateProduct.bind(null, product.id)} />
              <form action={deleteProduct.bind(null, product.id)} className="flex justify-end">
                <Button type="submit" variant="danger" size="sm">حذف المنتج</Button>
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <a href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-rawey-background">
      <span className="text-rawey-gold">{icon}</span>
      {children}
    </a>
  );
}

function SectionTitle({ icon, eyebrow, title, description }: { icon?: ReactNode; eyebrow?: string; title: string; description: string }) {
  return (
    <div>
      {eyebrow ? <p className="text-xs font-bold uppercase text-rawey-gold">{eyebrow}</p> : null}
      <div className="flex items-center gap-2">
        {icon ? <span className="text-rawey-gold">{icon}</span> : null}
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <p className="mt-1 text-sm text-rawey-muted">{description}</p>
    </div>
  );
}

function Stat({ icon, label, value, note }: { icon: ReactNode; label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-rawey-line bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-rawey-muted">{label}</p>
        <span className="rounded-full bg-rawey-gold/10 p-2 text-rawey-gold">{icon}</span>
      </div>
      <p className="mt-2 text-xl font-bold">{value}</p>
      {note ? <p className="mt-1 text-xs text-rawey-muted">{note}</p> : null}
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "shipped" | "delivered" }) {
  const labels = {
    pending: "قيد المتابعة",
    shipped: "تم الشحن",
    delivered: "تم التسليم"
  };

  return <Badge>{labels[status]}</Badge>;
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-rawey-line bg-white p-6 text-center text-sm text-rawey-muted">
      {children}
    </div>
  );
}

function tabClass(isActive: boolean) {
  return `rounded-full px-4 py-2 transition ${isActive ? "bg-rawey-text text-white" : "text-rawey-muted hover:text-rawey-text"}`;
}

function shortId(id: string) {
  return id.slice(0, 8);
}
