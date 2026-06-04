"use server";

import { checkoutSchema } from "@/lib/validations";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getShippingPrice } from "@/lib/data/settings";
import { getProductSizeLabel } from "@/lib/product-variants";
import { parseCartPayload, priceCartItems, type CanonicalVariant } from "@/lib/orders/pricing";
import { assertSameOriginRequest, getClientIp } from "@/lib/security/request";
import { checkRateLimit } from "@/lib/security/rate-limit";
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

  const productsList = args.items
    .map((item) => `- ${item.name} ${getProductSizeLabel(item.sizeMl)} × ${item.quantity} - ${formatPrice(item.price * item.quantity)}`)
    .join("\n");
  const paymentMethod = args.paymentMethod === "WISH" ? "تحويل ويش موني" : "الدفع عند الاستلام";
  const message = [
    "✨ طلب جديد من رَوِيّ",
    "",
    `🧾 رقم الطلب: ${args.orderId}`,
    "",
    "🛍️ المنتجات:",
    productsList,
    "",
    `💰 المجموع النهائي: ${formatPrice(args.totalPrice)}`,
    "",
    `📍 العنوان: ${args.deliveryAddress}`,
    "",
    `💳 طريقة الدفع: ${paymentMethod}`,
    "",
    "شكرًا لاختياركم رَوِيّ!"
  ].join("\n");

  return `https://wa.me/${shopPhone}?text=${encodeURIComponent(message)}`;
}

export async function createOrder(values: unknown, items: unknown): Promise<CheckoutResult> {
  await assertSameOriginRequest();
  const ip = await getClientIp();
  const rateLimit = checkRateLimit(`checkout:${ip}`, 8, 10 * 60 * 1000);

  if (!rateLimit.ok) {
    return { ok: false, message: "تم إرسال عدة طلبات خلال وقت قصير. حاول لاحقاً." };
  }

  const parsed = checkoutSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "يرجى التأكد من تعبئة معلومات الطلب بشكل صحيح." };
  }

  const cart = parseCartPayload(items);

  if (!cart.ok) {
    return { ok: false, message: cart.message };
  }

  const supabase = createServiceRoleClient();
  const variantIds = cart.items.map((item) => item.variantId);
  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, product_id, size_ml, price, is_active, product:products(id, name, brand, brand_slug, image_url, slug)")
    .in("id", variantIds);

  if (variantsError) {
    return { ok: false, message: variantsError.message };
  }

  const pricedCart = priceCartItems(cart.items, (variants || []) as CanonicalVariant[]);

  if (!pricedCart.ok) {
    return { ok: false, message: pricedCart.message };
  }

  const shippingPrice = await getShippingPrice();
  const totalPrice = pricedCart.subtotal + shippingPrice;
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
    pricedCart.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      price: item.price
    }))
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, message: itemsError.message };
  }

  const whatsappUrl = buildWhatsAppUrl({
    orderId: order.id,
    items: pricedCart.items,
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
