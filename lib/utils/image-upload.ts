"use server";

import { randomUUID } from "crypto";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { assertSameOriginRequest } from "@/lib/security/request";
import { createServiceRoleClient } from "@/lib/supabase/server";

const BUCKET_NAME = "product-images";
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/avif", "avif"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

export type ImageUploadResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function uploadProductImage(formData: FormData): Promise<ImageUploadResult> {
  await assertSameOriginRequest();
  await requireAdminSession();

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { ok: false, message: "اختر صورة للتحميل." };
  }

  const extension = ALLOWED_IMAGE_TYPES.get(file.type);

  if (!extension) {
    return { ok: false, message: "الصيغ المسموحة هي JPG وPNG وWebP وAVIF." };
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return { ok: false, message: "حجم الصورة يجب أن يكون أقل من 4MB." };
  }

  const supabase = createServiceRoleClient();
  const fileName = `${randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false
  });

  if (error) {
    return { ok: false, message: `فشل تحميل الصورة: ${error.message}` };
  }

  const { data: publicUrl } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return { ok: true, url: publicUrl.publicUrl };
}
