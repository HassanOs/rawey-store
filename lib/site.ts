export const siteConfig = {
  name: "Rawey",
  description: "متجر Rawey لعَيّنات العطور الأصلية بأحجام 3ml و5ml و10ml.",
  defaultUrl: "https://rawey.vercel.app",
  locale: "ar_LB",
  instagramUrl: "https://www.instagram.com/rawey.perfume"
};

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.defaultUrl).replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getSiteUrl()}${normalizedPath}`;
}
