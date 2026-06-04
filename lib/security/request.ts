import "server-only";

import { headers } from "next/headers";

export async function getClientIp() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();

  return forwardedFor || headerStore.get("x-real-ip") || "unknown";
}

export async function assertSameOriginRequest() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const host = headerStore.get("host");

  if (!origin || !host) {
    return;
  }

  try {
    if (new URL(origin).host === host) {
      return;
    }
  } catch {
    // Fall through to the same rejection path as a mismatched host.
  }

  throw new Error("Invalid request origin.");
}
