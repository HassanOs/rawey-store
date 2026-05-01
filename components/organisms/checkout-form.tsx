"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/atoms/button";
import { Input, Textarea } from "@/components/atoms/input";
import { Select } from "@/components/atoms/select";
import { createOrder } from "@/app/actions/checkout";
import { checkoutSchema, governorates, type CheckoutValues } from "@/lib/validations";
import { formatPrice } from "@/lib/utils";
import { getCartSubtotal, useCartStore } from "@/store/cart-store";

type CheckoutFormProps = {
  shippingPrice: number;
  wishMoneyName: string;
  wishMoneyPhone: string;
};

export function CheckoutForm({ shippingPrice, wishMoneyName, wishMoneyPhone }: CheckoutFormProps) {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const subtotal = getCartSubtotal(items);
  const total = subtotal + shippingPrice;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      phone: "+961",
      payment_method: "WISH"
    }
  });
  const paymentMethod = watch("payment_method");

  useEffect(() => setMounted(true), []);

  async function onSubmit(values: CheckoutValues) {
    if (isProcessing) {
      return;
    }

    setMessage("");
    setIsProcessing(true);

    try {
      const result = await createOrder(values, items);
      setMessage(result.message);

      if (!result.ok) {
        setIsProcessing(false);
        return;
      }

      clearCart();

      if (result.whatsappUrl) {
        window.location.assign(result.whatsappUrl);
        return;
      }

      router.push(`/checkout?success=${result.orderId}`);
    } catch {
      setMessage("حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.");
      setIsProcessing(false);
    }
  }

  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-[2rem] border border-rawey-line bg-white shadow-sm" />;
  }

  if (!items.length) {
    return (
      <div dir="rtl" className="rounded-[2rem] border border-rawey-line bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">لا يوجد طلب لإكماله</h1>
        <Button asChild href="/products" className="mt-8">
          العودة إلى المنتجات
        </Button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="grid gap-6 text-right lg:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-[2rem] border border-rawey-line bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">إتمام الطلب</h1>
        <p className="mt-2 text-sm text-rawey-muted">أدخل تفاصيل التوصيل داخل لبنان بدقة.</p>

        <div className="mt-6 grid gap-4">
          <label>
            <span className="mb-2 block text-sm font-semibold">الاسم الكامل</span>
            <Input {...register("full_name")} placeholder="مثال: حسن علي" autoComplete="name" className="text-right" />
            {errors.full_name ? <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p> : null}
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">رقم الهاتف</span>
            <Input {...register("phone")} inputMode="tel" placeholder="+961 76 519 756" autoComplete="tel" className="text-right" />
            {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p> : null}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold">المحافظة</span>
              <Select {...register("governorate")} defaultValue="" className="text-right">
                <option value="" disabled>
                  اختر المحافظة
                </option>
                {governorates.map((governorate) => (
                  <option key={governorate} value={governorate}>
                    {governorate}
                  </option>
                ))}
              </Select>
              {errors.governorate ? <p className="mt-1 text-xs text-red-600">{errors.governorate.message}</p> : null}
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">القضاء والمدينة</span>
              <Input {...register("district_city")} placeholder="مثال: بيروت، الحمراء" autoComplete="address-level2" className="text-right" />
              {errors.district_city ? <p className="mt-1 text-xs text-red-600">{errors.district_city.message}</p> : null}
            </label>
          </div>

          <label>
            <span className="mb-2 block text-sm font-semibold">تفاصيل العنوان</span>
            <Textarea {...register("address_details")} placeholder="اسم المبنى، الشارع، الطابق، رقم الشقة" className="text-right" />
            {errors.address_details ? <p className="mt-1 text-xs text-red-600">{errors.address_details.message}</p> : null}
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">أقرب نقطة دالة</span>
            <Input {...register("landmark")} placeholder="مثال: قرب جامع الأمين، مقابل بنك عوده" className="text-right" />
            {errors.landmark ? <p className="mt-1 text-xs text-red-600">{errors.landmark.message}</p> : null}
          </label>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold">طريقة الدفع</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-rawey-line p-4 transition focus-within:border-rawey-gold">
                <input {...register("payment_method")} type="radio" value="WISH" className="h-4 w-4 accent-rawey-gold" />
                <span>
                  <span className="block text-sm font-semibold">تحويل عبر ويش موني</span>
                  <span className="block text-xs text-rawey-muted">الخيار الأساسي</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-rawey-line p-4 transition focus-within:border-rawey-gold">
                <input {...register("payment_method")} type="radio" value="COD" className="h-4 w-4 accent-rawey-gold" />
                <span>
                  <span className="block text-sm font-semibold">الدفع عند الاستلام</span>
                  <span className="block text-xs text-rawey-muted">الدفع عند وصول الطلب</span>
                </span>
              </label>
            </div>
            {errors.payment_method ? <p className="mt-1 text-xs text-red-600">{errors.payment_method.message}</p> : null}
          </fieldset>

          {paymentMethod === "WISH" ? (
            <div className="rounded-2xl border border-rawey-gold/30 bg-rawey-gold/10 p-4 text-sm">
              <p className="font-semibold">تفاصيل تحويل ويش موني</p>
              <p className="mt-1 text-rawey-muted">الاسم: {wishMoneyName}</p>
              <p className="text-rawey-muted">رقم الهاتف: {wishMoneyPhone}</p>
            </div>
          ) : null}

          {message ? <p className="rounded-2xl bg-rawey-gold/10 p-3 text-sm">{message}</p> : null}

          <Button type="submit" disabled={isProcessing} className="w-full">
            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {isProcessing ? "جاري حفظ الطلب..." : "تأكيد الطلب عبر واتساب"}
          </Button>
        </div>
      </form>

      <aside className="h-fit rounded-[2rem] border border-rawey-line bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">ملخص الطلب</h2>
        <div className="mt-5 space-y-3 text-sm">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between gap-4">
              <span className="text-rawey-muted">
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-rawey-line pt-4">
            <span className="text-rawey-muted">التوصيل</span>
            <span>{formatPrice(shippingPrice)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>المجموع</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

