import { createServerClient } from "@/lib/supabase/server";

export const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export async function getShippingPrice() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("settings")
    .select("shipping_price")
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.shipping_price ?? 3;
}
