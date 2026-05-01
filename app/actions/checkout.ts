"use server";

import { checkoutSchema } from "@/lib/validations";
import { createServerClient } from "@/lib/supabase/server";
import { getShippingPrice } from "@/lib/data/settings";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

export type CheckoutResult = {
  ok: boolean;
  message: string;
  orderId?: string;
  whatsappUrl?: string;
};

function buildDeliveryAddress(values: {
  governorate: string;
  district_city: string;
  address_details: string;
  landmark: string;
}) {
  return `${values.governorate}، ${values.district_city}. ${values.address_details}. أقرب نقطة دالة: ${values.landmark}`;
}

function getShopWhatsappNumber() {
  return (process.env.SHOP_WHATSAPP_PHONE || process.env.WISH_MONEY_PHONE || "").replace(/[^\d]/g, "");
}

function buildWhatsAppUrl(args: {
  orderId: string;
  items: CartItem[];
  totalPrice: number;
  deliveryAddress: string;
  paymentMethod: "COD" | "WISH";
}) {
  const shopPhone = getShopWhatsappNumber();

  if (!shopPhone) {
    return undefined;
  }

  const itemsSummary = args.items
    .map((item) => `${item.name} ${item.sizeMl}مل × ${item.quantity} - ${formatPrice(item.price * item.quantity)}`)
    .join("، ");
  const paymentMethod = args.paymentMethod === "WISH" ? "تحويل ويش موني" : "الدفع عند الاستلام";
  const message = [
    "طلب جديد من روي",
    `رقم الطلب: ${args.orderId}`,
    `المنتجات: ${itemsSummary}`,
    `المجموع: ${formatPrice(args.totalPrice)}`,
    `العنوان: ${args.deliveryAddress}`,
    `طريقة الدفع: ${paymentMethod}`
  ].join("\n");

  return `https://wa.me/${shopPhone}?text=${encodeURIComponent(message)}`;
}

export async function createOrder(values: unknown, items: CartItem[]): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "يرجى التأكد من تعبئة معلومات الطلب بشكل صحيح." };
  }

  if (!items.length) {
    return { ok: false, message: "السلة فارغة." };
  }

  const supabase = createServerClient();
  const shippingPrice = await getShippingPrice();
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalPrice = subtotal + shippingPrice;
  const deliveryAddress = buildDeliveryAddress(parsed.data);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      full_name: parsed.data.full_name,
      phone_number: parsed.data.phone,
      governorate: parsed.data.governorate,
      district_city: parsed.data.district_city,
      address_details: parsed.data.address_details,
      landmark: parsed.data.landmark,
      payment_method: parsed.data.payment_method,
      shipping_price: shippingPrice,
      total_price: totalPrice,
      status: "pending"
    })
    .select("id")
    .single();

  if (orderError || !order?.id) {
    return { ok: false, message: orderError?.message || "تعذر حفظ الطلب." };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      price: item.price
    }))
  );

  if (itemsError) {
    return { ok: false, message: itemsError.message };
  }

  const whatsappUrl = buildWhatsAppUrl({
    orderId: order.id,
    items,
    totalPrice,
    deliveryAddress,
    paymentMethod: parsed.data.payment_method
  });

  return {
    ok: true,
    message: whatsappUrl ? "تم حفظ الطلب. سيتم فتح واتساب لتأكيده." : "تم حفظ الطلب بنجاح.",
    orderId: order.id,
    whatsappUrl
  };
}

