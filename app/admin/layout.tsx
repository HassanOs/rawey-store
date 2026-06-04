import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة الإدارة",
  robots: {
    index: false,
    follow: false
  }
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className="flex-1">{children}</main>;
}
