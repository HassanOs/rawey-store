"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { productFormSchema } from "@/lib/validations";
import { createServerClient } from "@/lib/supabase/server";
import { SETTINGS_ID } from "@/lib/data/settings";

const ADMIN_COOKIE = "rawey_admin";

function adminToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }
  return createHash("sha256").update(password).digest("hex");
}

export async function isAdminSession() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === adminToken();
}

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") || "");

  if (password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/"
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/admin");
}

function parseProductForm(formData: FormData) {
  const sizes = formData.getAll("size_ml").map(String);
  const prices = formData.getAll("price").map(String);
  const ids = formData.getAll("variant_id").map(String);

  return productFormSchema.parse({
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
      .filter((variant) => variant.size_ml && variant.price)
  });
}

async function assertAdmin() {
  if (!(await isAdminSession())) {
    redirect("/admin");
  }
}

export async function createProduct(formData: FormData) {
  await assertAdmin();
  const supabase = createServerClient();
  const product = parseProductForm(formData);

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      brand: product.brand,
      description: product.description,
      image_url: product.image_url
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Could not create product.");
  }

  const { error: variantsError } = await supabase.from("product_variants").insert(
    product.variants.map((variant) => ({
      product_id: data.id,
      size_ml: variant.size_ml,
      price: variant.price
    }))
  );

  if (variantsError) {
    throw new Error(variantsError.message);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
}

export async function updateProduct(productId: string, formData: FormData) {
  await assertAdmin();
  const supabase = createServerClient();
  const product = parseProductForm(formData);

  const { error } = await supabase
    .from("products")
    .update({
      name: product.name,
      brand: product.brand,
      description: product.description,
      image_url: product.image_url
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  const existingIds = product.variants.map((variant) => variant.id).filter(Boolean) as string[];
  if (existingIds.length) {
    const { data: current } = await supabase.from("product_variants").select("id").eq("product_id", productId);
    const staleIds = (current || []).map((variant) => variant.id).filter((id) => !existingIds.includes(id));
    if (staleIds.length) {
      await supabase.from("product_variants").delete().in("id", staleIds);
    }
  } else {
    await supabase.from("product_variants").delete().eq("product_id", productId);
  }

  for (const variant of product.variants) {
    if (variant.id) {
      await supabase.from("product_variants").update({ size_ml: variant.size_ml, price: variant.price }).eq("id", variant.id);
    } else {
      await supabase.from("product_variants").insert({ product_id: productId, size_ml: variant.size_ml, price: variant.price });
    }
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/product/${productId}`);
  revalidatePath("/admin");
}

export async function deleteProduct(productId: string) {
  await assertAdmin();
  const supabase = createServerClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
}

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await assertAdmin();
  const status = String(formData.get("status") || "pending") as "pending" | "shipped" | "delivered";
  const supabase = createServerClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}

export async function updateShippingPrice(formData: FormData) {
  await assertAdmin();
  const shippingPrice = Number(formData.get("shipping_price") || 0);
  const supabase = createServerClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ id: SETTINGS_ID, shipping_price: shippingPrice }, { onConflict: "id" });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/admin");
}
