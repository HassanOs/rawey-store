import type { Metadata } from "next";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { AdminDashboard } from "@/components/organisms/admin-dashboard";
import { getAdminOrders, getStats } from "@/lib/data/admin";
import { getProducts } from "@/lib/data/products";
import { getShippingPrice } from "@/lib/data/settings";
import { isAdminSession, loginAdmin } from "./actions";

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
        <form action={loginAdmin} className="w-full rounded-2xl border border-rawey-line bg-white p-6 shadow-sm">
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

  return <AdminDashboard products={products} orders={orders} stats={stats} shippingPrice={shippingPrice} />;
}
