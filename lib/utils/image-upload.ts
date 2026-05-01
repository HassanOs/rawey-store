import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "product-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadProductImage(file: File): Promise<string> {
  // Validate file
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size must be less than 5MB");
  }

  const supabase = createClient();

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrl } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return publicUrl.publicUrl;
}
