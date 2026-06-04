import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "rawey_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  return password;
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return getAdminPassword();
  }

  throw new Error("ADMIN_SESSION_SECRET is not configured.");
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function signSession(expiresAt: number, nonce: string) {
  return createHmac("sha256", getSessionSecret()).update(`${expiresAt}.${nonce}`).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyAdminPassword(value: string) {
  return timingSafeEqual(digest(value), digest(getAdminPassword()));
}

export function createAdminSessionToken(now = Date.now()) {
  const expiresAt = now + ADMIN_SESSION_MAX_AGE * 1000;
  const nonce = randomBytes(32).toString("base64url");
  const signature = signSession(expiresAt, nonce);

  return `v1.${expiresAt}.${nonce}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined, now = Date.now()) {
  if (!token) {
    return false;
  }

  const [version, expiresAtValue, nonce, signature] = token.split(".");
  const expiresAt = Number(expiresAtValue);

  if (version !== "v1" || !Number.isFinite(expiresAt) || !nonce || !signature || expiresAt <= now) {
    return false;
  }

  return safeEqual(signature, signSession(expiresAt, nonce));
}

export async function isAdminSession() {
  const cookieStore = await cookies();

  return verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function requireAdminSession() {
  if (!(await isAdminSession())) {
    throw new Error("Unauthorized admin request.");
  }
}
