import type { Metadata } from "next";
import { CartList } from "@/components/organisms/cart-list";
import { getShippingPrice } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "السلة",
  description: "راجع طلبك قبل إتمام الشراء."
};

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const shippingPrice = await getShippingPrice();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <CartList shippingPrice={shippingPrice} />
    </section>
  );
}
