import { Settings, Truck } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { AdminPageHeader } from "@/components/organisms/admin-page-header";
import { getShippingPrice } from "@/lib/data/settings";
import { formatPrice } from "@/lib/utils";
import { updateShippingPrice } from "@/app/admin/actions";

export default async function AdminSettingsPage() {
  const shippingPrice = await getShippingPrice();

  return (
    <>
      <AdminPageHeader
        icon={<Settings className="h-5 w-5" />}
        title="الإعدادات"
        summary={`سعر التوصيل الحالي ${formatPrice(shippingPrice)}`}
      />

      <section className="w-full rounded-2xl border border-rawey-line bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-rawey-gold/10 p-2 text-rawey-gold">
            <Truck className="h-4 w-4" />
          </span>
          <h3 className="text-base font-bold">التوصيل</h3>
        </div>

        <form action={updateShippingPrice} className="mt-5 grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto] md:items-end">
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-semibold text-rawey-muted">سعر التوصيل</span>
            <Input name="shipping_price" type="number" min="0" step="0.01" defaultValue={shippingPrice} required />
          </label>
          <Button type="submit" className="w-full md:w-auto">حفظ</Button>
        </form>
      </section>
    </>
  );
}
