import type { Metadata } from "next";
import Image from "next/image";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LogOut,
  PackagePlus,
  Settings,
  ShoppingBag,
  Truck
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Select } from "@/components/atoms/select";
import { AdminProductForm } from "@/components/organisms/admin-product-form";
import { getAdminOrders, getStats } from "@/lib/data/admin";
import { getProducts } from "@/lib/data/products";
import { getShippingPrice } from "@/lib/data/settings";
import { formatPrice } from "@/lib/utils";
import {
  createProduct,
  deleteProduct,
  isAdminSession,
  loginAdmin,
  logoutAdmin,
  updateOrderStatus,
  updateProduct,
  updateShippingPrice
} from "./actions";

export const metadata: Metadata = {
  title: "لوحة الإدارة",
  robots: {
    index: false,
    follow: false
  }
};

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [{ error }, isAdmin] = await Promise.all([searchParams, isAdminSession()]);

  if (!isAdmin) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
        <form action={loginAdmin} className="w-full rounded-[2rem] border border-rawey-line bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">دخول الإدارة</h1>
          <p className="mt-2 text-sm text-rawey-muted">أدخل كلمة المرور المحددة في متغير ADMIN_PASSWORD.</p>
          <Input name="password" type="password" placeholder="كلمة المرور" className="mt-6" required />
          {error ? <p className="mt-3 text-sm text-red-600">كلمة المرور غير صحيحة.</p> : null}
          <Button type="submit" className="mt-5 w-full">
            دخول
          </Button>
        </form>
      </section>
    );
  }

  const [products, orders, stats, shippingPrice] = await Promise.all([
    getProducts(),
    getAdminOrders(),
    getStats(),
    getShippingPrice()
  ]);
  const activeOrders = stats.totalOrders - stats.deliveredOrders;
  const averageOrder = stats.totalOrders ? stats.totalRevenue / stats.totalOrders : 0;

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[2rem] border border-rawey-line bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-rawey-line pb-4">
            <Image src="/images/logo.svg" alt="Rawey Logo" width={56} height={56} />
            <div>
              <p className="text-xs font-semibold text-rawey-muted">Rawey</p>
              <h1 className="text-xl font-bold">لوحة الإدارة</h1>
            </div>
          </div>

          <nav className="mt-4 space-y-2 text-sm font-semibold">
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

      <div className="space-y-8">
        <SectionHeader
          id="overview"
          eyebrow="Overview"
          title="نظرة عامة"
          description="مؤشرات سريعة عن المبيعات، حالة الطلبات، وحجم الكتالوج."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={<ShoppingBag className="h-5 w-5" />} label="إجمالي الطلبات" value={String(stats.totalOrders)} />
          <Stat icon={<Truck className="h-5 w-5" />} label="طلبات نشطة" value={String(activeOrders)} />
          <Stat icon={<BarChart3 className="h-5 w-5" />} label="الإيراد" value={formatPrice(stats.totalRevenue)} />
          <Stat icon={<Boxes className="h-5 w-5" />} label="المنتجات" value={String(products.length)} note={`متوسط الطلب ${formatPrice(averageOrder)}`} />
        </div>

        <section id="orders" className="scroll-mt-24">
          <SectionTitle
            icon={<ClipboardList className="h-5 w-5" />}
            title="الطلبات"
            description={`${stats.pendingOrders} قيد المتابعة، ${stats.deliveredOrders} تم تسليمه.`}
          />
          <div className="mt-4 space-y-4">
            {orders.length ? (
              orders.map((order) => (
                <article key={order.id} className="rounded-[2rem] border border-rawey-line bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{order.full_name}</h3>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 text-sm text-rawey-muted">{order.phone_number}</p>
                      <p className="mt-1 text-sm text-rawey-muted">
                        {[order.governorate, order.district_city, order.address_details, order.landmark].filter(Boolean).join(" - ")}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{formatPrice(order.total_price)}</p>
                      <p className="mt-1 text-xs text-rawey-muted">{order.payment_method}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-rawey-background p-3 text-sm">
                    {order.items.map((item) => (
                      <p key={item.id}>
                        {item.product?.name || "منتج"} - {item.variant?.size_ml || "-"}ml x {item.quantity}
                      </p>
                    ))}
                  </div>

                  <form action={updateOrderStatus.bind(null, order.id)} className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Select name="status" defaultValue={order.status}>
                      <option value="pending">قيد المتابعة</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التسليم</option>
                    </Select>
                    <Button type="submit" variant="secondary">
                      تحديث
                    </Button>
                  </form>
                </article>
              ))
            ) : (
              <EmptyState>لا توجد طلبات حالياً.</EmptyState>
            )}
          </div>
        </section>

        <section id="inventory" className="scroll-mt-24">
          <SectionTitle
            icon={<Boxes className="h-5 w-5" />}
            title="المخزون"
            description="إدارة المنتجات، الأحجام، الأسعار، وصورة كل عطر."
          />
          <div className="mt-4 grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className="space-y-6">
              <div>
                <SectionLabel icon={<PackagePlus className="h-4 w-4" />}>إضافة منتج</SectionLabel>
                <AdminProductForm action={createProduct} />
              </div>

              <form action={updateShippingPrice} className="rounded-[2rem] border border-rawey-line bg-white p-5 shadow-sm">
                <SectionLabel icon={<Settings className="h-4 w-4" />}>سعر التوصيل</SectionLabel>
                <div className="mt-4 flex gap-2">
                  <Input name="shipping_price" type="number" min="0" step="0.01" defaultValue={shippingPrice} required />
                  <Button type="submit">حفظ</Button>
                </div>
              </form>
            </div>

            <div className="space-y-5">
              {products.length ? (
                products.map((product) => (
                  <div key={product.id} className="space-y-3 border-b border-rawey-line pb-5 last:border-b-0 last:pb-0">
                    <AdminProductForm product={product} action={updateProduct.bind(null, product.id)} />
                    <form action={deleteProduct.bind(null, product.id)} className="flex justify-end">
                      <Button type="submit" variant="danger" size="sm">
                        حذف المنتج
                      </Button>
                    </form>
                  </div>
                ))
              ) : (
                <EmptyState>لا توجد منتجات في المخزون.</EmptyState>
              )}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function SidebarLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <a href={href} className="flex items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-rawey-background">
      <span className="text-rawey-gold">{icon}</span>
      {children}
    </a>
  );
}

function SectionHeader({
  id,
  eyebrow,
  title,
  description
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header id={id} className="scroll-mt-24 rounded-[2rem] border border-rawey-line bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase text-rawey-gold">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-rawey-muted">{description}</p>
    </header>
  );
}

function SectionTitle({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-rawey-gold">{icon}</span>
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <p className="mt-1 text-sm text-rawey-muted">{description}</p>
      </div>
    </div>
  );
}

function SectionLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
      <span className="text-rawey-gold">{icon}</span>
      {children}
    </h3>
  );
}

function Stat({ icon, label, value, note }: { icon: ReactNode; label: string; value: string; note?: string }) {
  return (
    <div className="rounded-[2rem] border border-rawey-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-rawey-muted">{label}</p>
        <span className="rounded-full bg-rawey-gold/10 p-2 text-rawey-gold">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
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
    <div className="rounded-[2rem] border border-dashed border-rawey-line bg-white p-6 text-center text-sm text-rawey-muted">
      {children}
    </div>
  );
}
