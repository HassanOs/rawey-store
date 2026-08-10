import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing.");
  }

  return url;
}

export function createPublicServerClient() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
  }

  return createSupabaseClient<Database>(getSupabaseUrl(), key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    console.error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to the public Supabase server client.",
    );
    return createPublicServerClient();
  }

  return createSupabaseClient<Database>(getSupabaseUrl(), key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createServiceRoleClient() {
  return createAdminClient();
}
