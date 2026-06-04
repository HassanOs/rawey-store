"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, Boxes, ClipboardList, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { logoutAdmin } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin/overview", label: "نظرة عامة", icon: BarChart3 },
  { href: "/admin/orders", label: "الطلبات", icon: ClipboardList },
  { href: "/admin/products", label: "المنتجات", icon: Boxes },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings }
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <section className="grid w-full min-w-0 gap-5 px-4 py-4 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
      <aside className="min-w-0 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
        <div className="flex h-full flex-col rounded-2xl border border-rawey-line bg-white p-4 shadow-sm">
          <Link href="/admin/overview" className="flex items-center gap-3 border-b border-rawey-line pb-4">
            <Image src="/images/logo.svg" alt="Rawey Logo" width={64} height={49} />
            <div>
              <p className="text-xs font-semibold text-rawey-muted">Rawey</p>
              <h1 className="text-lg font-bold">لوحة الإدارة</h1>
            </div>
          </Link>

          <nav className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold lg:block lg:space-y-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-xl px-3 py-2.5 transition",
                    isActive ? "bg-rawey-text text-white" : "text-rawey-text hover:bg-rawey-background"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-rawey-gold" : "text-rawey-gold")} />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <form action={logoutAdmin} className="mt-4 border-t border-rawey-line pt-4 lg:mt-auto">
            <Button variant="secondary" className="w-full">
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 space-y-5 overflow-hidden">{children}</div>
    </section>
  );
}
