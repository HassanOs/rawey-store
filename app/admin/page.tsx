import type { Metadata } from "next";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Select } from "@/components/atoms/select";
import { AdminProductForm } from "@/components/organisms/admin-product-form";
import { getProducts } from "@/lib/data/products";
import { getShippingPrice } from "@/lib/data/settings";
import { formatPrice } from "@/lib/utils";
import { getAdminOrders, getStats } from "@/lib/data/admin";
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

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-rawey-line pb-8">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.svg"
            alt="Rawey Logo"
            width={64}
            height={64}
          />
          <div>
            <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
            <p className="mt-1 text-xs text-rawey-muted">إدارة المنتجات والطلبات والتوصيل.</p>
          </div>
        </div>
        <form action={logoutAdmin}>
          <Button variant="secondary">
            <LogOut className="h-4 w-4" />
            خروج
          </Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="الطلبات" value={String(stats.totalOrders)} />
        <Stat label="قيد المتابعة" value={String(stats.pendingOrders)} />
        <Stat label="تم التسليم" value={String(stats.deliveredOrders)} />
        <Stat label="الإيراد" value={formatPrice(stats.totalRevenue)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-xl font-semibold">إضافة منتج</h2>
            <AdminProductForm action={createProduct} />
          </div>
          <form action={updateShippingPrice} className="rounded-[2rem] border border-rawey-line bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">سعر التوصيل</h2>
            <div className="mt-4 flex gap-2">
              <Input name="shipping_price" type="number" min="0" step="0.01" defaultValue={shippingPrice} required />
              <Button type="submit">حفظ</Button>
            </div>
          </form>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-xl font-semibold">المنتجات</h2>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="rounded-[2rem] border border-rawey-line bg-white p-5 shadow-sm">
                  <AdminProductForm product={product} action={updateProduct.bind(null, product.id)} />
                  <form action={deleteProduct.bind(null, product.id)} className="mt-3">
                    <Button type="submit" variant="danger" size="sm">
                      حذف المنتج
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">الطلبات</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="rounded-[2rem] border border-rawey-line bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{order.full_name}</h3>
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
                  <form action={updateOrderStatus.bind(null, order.id)} className="mt-4 flex gap-2">
                    <Select name="status" defaultValue={order.status}>
                      <option value="pending">pending</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                    </Select>
                    <Button type="submit" variant="secondary">
                      تحديث
                    </Button>
                  </form>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2rem] border border-rawey-line bg-white p-5 shadow-sm">
      <p className="text-sm text-rawey-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
