import { z } from "zod";

export const governorates = [
  "بيروت",
  "جبل لبنان",
  "الشمال",
  "عكار",
  "البقاع",
  "بعلبك الهرمل",
  "الجنوب",
  "النبطية"
] as const;

function normalizeLebanesePhone(value: string) {
  const phone = value.replace(/[\s\-()]/g, "");

  if (phone.startsWith("+961")) {
    const local = phone.slice(4).replace(/^0/, "");
    return `+961${local}`;
  }

  if (phone.startsWith("00961")) {
    const local = phone.slice(5).replace(/^0/, "");
    return `+961${local}`;
  }

  if (/^03\d{6}$/.test(phone)) {
    return `+961${phone.slice(1)}`;
  }

  if (/^0(70|71|76|78|79|81)\d{6}$/.test(phone)) {
    return `+961${phone.slice(1)}`;
  }

  if (/^(70|71|76|78|79|81)\d{6}$/.test(phone)) {
    return `+961${phone}`;
  }

  return phone;
}

const lebanesePhoneSchema = z
  .string()
  .transform(normalizeLebanesePhone)
  .refine((value) => /^\+961(3\d{6}|(70|71|76|78|79|81)\d{6})$/.test(value), "أدخل رقماً لبنانياً صحيحاً مثل +96176519756 أو 76519756 أو 03XXXXXX");

export const checkoutSchema = z.object({
  full_name: z.string().min(2, "الاسم الكامل مطلوب"),
  phone: lebanesePhoneSchema,
  governorate: z.enum(governorates, {
    required_error: "اختر المحافظة"
  }),
  district_city: z.string().min(2, "القضاء والمدينة مطلوبان"),
  address_details: z.string().min(6, "أدخل تفاصيل العنوان"),
  landmark: z.string().min(3, "أدخل أقرب نقطة دالة"),
  payment_method: z.enum(["COD", "WISH"], {
    required_error: "اختر طريقة الدفع"
  })
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const productFormSchema = z.object({
  name: z.string().min(2, "اسم المنتج مطلوب"),
  brand: z.string().min(2, "العلامة مطلوبة"),
  description: z.string().min(10, "الوصف قصير جداً"),
  image_url: z.string().url("رابط الصورة غير صالح"),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        size_ml: z.coerce.number().refine((value) => [1, 3, 5, 10].includes(value), "حجم غير صالح"),
        price: z.coerce.number().positive("السعر مطلوب")
      })
    )
    .min(1, "أضف حجماً واحداً على الأقل")
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

