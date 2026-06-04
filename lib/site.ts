export const siteConfig = {
  name: "Rawey",
  description: "متجر Rawey لعَيّنات العطور الأصلية في لبنان بأحجام 3ml و5ml و10ml مع توصيل داخل لبنان.",
  defaultUrl: "https://rawey.vercel.app",
  locale: "ar_LB",
  instagramUrl: "https://www.instagram.com/rawey.perfume",
  location: {
    countryCode: "LB",
    countryName: "Lebanon",
    countryNameAr: "لبنان",
    locality: "Dinnieh",
    localityAr: "الضنية"
  },
  keywords: [
    "عيّنات عطور لبنان",
    "عطور أصلية لبنان",
    "تقسيمات عطور لبنان",
    "perfume testers Lebanon",
    "Rawey Lebanon"
  ]
};

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.defaultUrl).replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getSiteUrl()}${normalizedPath}`;
}
