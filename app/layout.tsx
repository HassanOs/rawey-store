import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Footer } from "@/components/organisms/footer";
import { Navbar } from "@/components/organisms/navbar";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://rawey.vercel.app"),
  title: {
    default: "Rawey | Perfume Testers",
    template: "%s | Rawey"
  },
  description: "متجر Rawey لعَيّنات العطور الأصلية بأحجام 3ml و5ml و10ml.",
  openGraph: {
    title: "Rawey",
    description: "عطور أصلية للتجربة قبل الشراء.",
    siteName: "Rawey",
    locale: "ar_LB",
    type: "website"
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
        <Navbar />
        <main className="flex-1 pt-4 sm:pt-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
