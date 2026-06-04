"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { productFormSchema } from "@/lib/validations";
import { isAllowedProductSize } from "@/lib/product-variants";
import { createUniqueProductSlugs, productPath } from "@/lib/products/slug";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { SETTINGS_ID } from "@/lib/data/settings";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  requireAdminSession,
  verifyAdminPassword
} from "@/lib/auth/admin-session";
import { assertSameOriginRequest, getClientIp } from "@/lib/security/request";
import { checkRateLimit } from "@/lib/security/rate-limit";

const uuidSchema = z.string().uuid();
const orderStatusSchema = z.enum(["pending", "shipped", "delivered"]);
const shippingPriceSchema = z.coerce.number().min(0).max(1000);

export type AdminProductFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

const adminProductFormInitialState: AdminProductFormState = {
  status: "idle",
  message: ""
};

export async function loginAdmin(formData: FormData) {
  await assertSameOriginRequest();
  const ip = await getClientIp();
  const rateLimit = checkRateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000);
  const password = String(formData.get("password") || "");

  if (!rateLimit.ok) {
    redirect("/admin?error=rate");
  }

  if (!verifyAdminPassword(password)) {
    redirect("/admin?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: "/admin"
  });

  redirect("/admin/overview");
}

export async function logoutAdmin() {
  await assertSameOriginRequest();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/admin",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  });
  redirect("/admin");
}

function parseProductForm(formData: FormData) {
  const sizes = formData.getAll("size_ml").map(String);
  const prices = formData.getAll("price").map(String);
  const ids = formData.getAll("variant_id").map(String);

  const parsed = productFormSchema.safeParse({
    name: String(formData.get("name") || ""),
    brand: String(formData.get("brand") || ""),
    description: String(formData.get("description") || ""),
    image_url: String(formData.get("image_url") || ""),
    variants: sizes
      .map((size, index) => ({
        id: ids[index] || undefined,
        size_ml: size,
        price: prices[index]
      }))
      .filter((variant) => isAllowedProductSize(Number(variant.size_ml)) && variant.price)
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message || "تأكد من تعبئة معلومات المنتج بشكل صحيح."
    };
  }

  return { ok: true as const, product: parsed.data };
}

async function assertAdmin() {
  await assertSameOriginRequest();

  try {
    await requireAdminSession();
  } catch {
    redirect("/admin");
  }
}

export async function createProduct(
  previousState: AdminProductFormState = adminProductFormInitialState,
  formData: FormData
): Promise<AdminProductFormState> {
  void previousState;
  await assertAdmin();
  const supabase = createServiceRoleClient();
  const parsed = parseProductForm(formData);

  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const { product } = parsed;
  const { brandSlug, productSlug } = await createUniqueProductSlugs(supabase, product);

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      brand: product.brand,
      description: product.description,
      image_url: product.image_url,
      brand_slug: brandSlug,
      slug: productSlug
    })
    .select("id, brand_slug, slug")
    .single();

  if (error || !data) {
    return { status: "error", message: error?.message || "تعذر إنشاء المنتج." };
  }

  const { error: variantsError } = await supabase.from("product_variants").insert(
    product.variants.map((variant) => ({
      product_id: data.id,
      size_ml: variant.size_ml,
      price: variant.price,
      is_active: true
    }))
  );

  if (variantsError) {
    await supabase.from("products").delete().eq("id", data.id);
    return { status: "error", message: variantsError.message };
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${data.brand_slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath(productPath({ id: data.id, name: product.name, brand: product.brand, brand_slug: data.brand_slug, slug: data.slug }));
  revalidateAdminDashboard();

  return { status: "success", message: "تمت إضافة المنتج بنجاح." };
}

export async function updateProduct(
  productId: string,
  previousState: AdminProductFormState = adminProductFormInitialState,
  formData: FormData
): Promise<AdminProductFormState> {
  void previousState;
  await assertAdmin();
  const safeProductId = uuidSchema.safeParse(productId);

  if (!safeProductId.success) {
    return { status: "error", message: "معرّف المنتج غير صالح." };
  }

  const supabase = createServiceRoleClient();
  const parsed = parseProductForm(formData);

  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  const { product } = parsed;
  const { data: currentProduct } = await supabase
    .from("products")
    .select("brand, name, brand_slug, slug")
    .eq("id", safeProductId.data)
    .maybeSingle();
  const { brandSlug, productSlug } = await createUniqueProductSlugs(supabase, product, safeProductId.data);

  const { error } = await supabase
    .from("products")
    .update({
      name: product.name,
      brand: product.brand,
      description: product.description,
      image_url: product.image_url,
      brand_slug: brandSlug,
      slug: productSlug
    })
    .eq("id", safeProductId.data);

  if (error) {
    return { status: "error", message: error.message };
  }

  const existingIds = product.variants.map((variant) => variant.id).filter(Boolean) as string[];
  if (existingIds.length) {
    const { data: current } = await supabase
      .from("product_variants")
      .select("id")
      .eq("product_id", safeProductId.data)
      .neq("size_ml", 1)
      .eq("is_active", true);
    const staleIds = (current || []).map((variant) => variant.id).filter((id) => !existingIds.includes(id));
    if (staleIds.length) {
      const { error: staleError } = await supabase.from("product_variants").update({ is_active: false }).in("id", staleIds);

      if (staleError) {
        return { status: "error", message: staleError.message };
      }
    }
  } else {
    const { error: staleError } = await supabase
      .from("product_variants")
      .update({ is_active: false })
      .eq("product_id", safeProductId.data)
      .neq("size_ml", 1)
      .eq("is_active", true);

    if (staleError) {
      return { status: "error", message: staleError.message };
    }
  }

  for (const variant of product.variants) {
    if (variant.id) {
      const { error: variantError } = await supabase
        .from("product_variants")
        .update({ size_ml: variant.size_ml, price: variant.price, is_active: true })
        .eq("id", variant.id);

      if (variantError) {
        return { status: "error", message: variantError.message };
      }

      continue;
    }

    const { data: existingVariant, error: existingVariantError } = await supabase
      .from("product_variants")
      .select("id")
      .eq("product_id", safeProductId.data)
      .eq("size_ml", variant.size_ml)
      .maybeSingle();

    if (existingVariantError) {
      return { status: "error", message: existingVariantError.message };
    }

    if (existingVariant) {
      const { error: variantError } = await supabase
        .from("product_variants")
        .update({ price: variant.price, is_active: true })
        .eq("id", existingVariant.id);

      if (variantError) {
        return { status: "error", message: variantError.message };
      }

      continue;
    }

    const { error: variantError } = await supabase
      .from("product_variants")
      .insert({ product_id: safeProductId.data, size_ml: variant.size_ml, price: variant.price, is_active: true });

    if (variantError) {
      return { status: "error", message: variantError.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${brandSlug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath(productPath({ id: safeProductId.data, name: product.name, brand: product.brand, brand_slug: brandSlug, slug: productSlug }));
  if (currentProduct?.brand_slug) {
    revalidatePath(`/products/${currentProduct.brand_slug}`);
  }
  if (currentProduct?.brand_slug && currentProduct?.slug) {
    revalidatePath(
      productPath({
        id: safeProductId.data,
        name: currentProduct.name,
        brand: currentProduct.brand,
        brand_slug: currentProduct.brand_slug,
        slug: currentProduct.slug
      })
    );
  }
  revalidateAdminDashboard();

  return { status: "success", message: "تم حفظ التعديلات بنجاح." };
}

export async function deleteProduct(productId: string) {
  await assertAdmin();
  const safeProductId = uuidSchema.parse(productId);
  const supabase = createServiceRoleClient();
  const { data: currentProduct } = await supabase
    .from("products")
    .select("id, name, brand, brand_slug, slug")
    .eq("id", safeProductId)
    .maybeSingle();
  const { error } = await supabase.from("products").delete().eq("id", safeProductId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/products");
  if (currentProduct?.brand_slug) {
    revalidatePath(`/products/${currentProduct.brand_slug}`);
  }
  if (currentProduct) {
    revalidatePath(productPath(currentProduct));
  }
  revalidatePath("/sitemap.xml");
  revalidateAdminDashboard();
}

export async function deleteProducts(formData: FormData) {
  await assertAdmin();
  const productIds = z.array(uuidSchema).max(100).parse(formData.getAll("product_id").map(String).filter(Boolean));

  if (!productIds.length) {
    return;
  }

  const supabase = createServiceRoleClient();
  const { data: currentProducts } = await supabase
    .from("products")
    .select("id, name, brand, brand_slug, slug")
    .in("id", productIds);
  const { error } = await supabase.from("products").delete().in("id", productIds);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/products");
  for (const product of currentProducts || []) {
    if (product.brand_slug) {
      revalidatePath(`/products/${product.brand_slug}`);
    }
    revalidatePath(productPath(product));
  }
  revalidatePath("/sitemap.xml");
  revalidateAdminDashboard();
}

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await assertAdmin();
  const safeOrderId = uuidSchema.parse(orderId);
  const status = orderStatusSchema.parse(String(formData.get("status") || "pending"));
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", safeOrderId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/overview");
  revalidatePath("/admin/orders");
}

export async function updateShippingPrice(formData: FormData) {
  await assertAdmin();
  const shippingPrice = shippingPriceSchema.parse(formData.get("shipping_price") || 0);
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ id: SETTINGS_ID, shipping_price: shippingPrice }, { onConflict: "id" });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/admin/overview");
  revalidatePath("/admin/settings");
}

function revalidateAdminDashboard() {
  revalidatePath("/admin/overview");
  revalidatePath("/admin/products");
}
