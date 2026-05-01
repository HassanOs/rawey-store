import type { Metadata } from "next";
import { CheckoutForm } from "@/components/organisms/checkout-form";
import { getShippingPrice } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "إتمام الطلب",
  description: "أدخل معلومات التوصيل لإكمال طلب Rawey."
};

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  searchParams: Promise<{ success?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const [{ success }, shippingPrice] = await Promise.all([searchParams, getShippingPrice()]);
  const wishMoneyName = process.env.WISH_MONEY_NAME || "Rawey";
  const wishMoneyPhone = process.env.WISH_MONEY_PHONE || "+961 00 000 000";

  if (success) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-rawey-line bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold text-rawey-gold">تم استلام الطلب</p>
          <h1 className="mt-3 text-3xl font-bold">شكراً لاختيار Rawey</h1>
          <p className="mt-3 text-rawey-muted">سنراجع طلبك ونتواصل معك قريباً لتأكيد التفاصيل.</p>
          <p className="mt-6 rounded-2xl bg-rawey-background p-3 text-sm">رقم الطلب: {success}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <CheckoutForm shippingPrice={shippingPrice} wishMoneyName={wishMoneyName} wishMoneyPhone={wishMoneyPhone} />
    </section>
  );
}
