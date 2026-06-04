import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { ToastProvider } from "@/components/organisms/toast-provider";
import { absoluteUrl, getSiteUrl, siteConfig } from "@/lib/site";
import { stringifyJsonLd } from "@/lib/seo/json-ld";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteConfig.name} | عيّنات عطور أصلية في لبنان`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  openGraph: {
    title: `${siteConfig.name} | عيّنات عطور أصلية في لبنان`,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: "/images/rawey-hero.webp",
        width: 1400,
        height: 1050,
        alt: "Rawey perfume testers in Lebanon"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | عيّنات عطور أصلية في لبنان`,
    description: siteConfig.description,
    images: ["/images/rawey-hero.webp"]
  }
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: siteConfig.name,
  description: siteConfig.description,
  url: getSiteUrl(),
  logo: absoluteUrl("/images/logo.svg"),
  image: absoluteUrl("/images/rawey-hero.webp"),
  sameAs: [siteConfig.instagramUrl],
  areaServed: {
    "@type": "Country",
    name: siteConfig.location.countryName,
    alternateName: siteConfig.location.countryNameAr
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: siteConfig.location.countryCode,
    addressLocality: siteConfig.location.locality
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: stringifyJsonLd(organizationJsonLd) }}
        />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
