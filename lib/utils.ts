import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LATIN_DIGIT_ARABIC_LOCALE = "ar-LB-u-nu-latn";

export function formatPrice(value: number) {
  return new Intl.NumberFormat(LATIN_DIGIT_ARABIC_LOCALE, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    numberingSystem: "latn"
  }).format(value);
}

export function formatDate(value: string | number | Date) {
  return new Intl.DateTimeFormat(LATIN_DIGIT_ARABIC_LOCALE, {
    numberingSystem: "latn"
  }).format(new Date(value));
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://rawey.vercel.app";
}
