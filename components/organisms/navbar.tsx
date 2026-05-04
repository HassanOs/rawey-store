"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/button";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cart-store";

export function Navbar() {
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const count = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    let active = true;

    async function loadAdminState() {
      setMounted(true);

      const supabase = createClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!active || !session?.user) {
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      const profile = data as { role?: string } | null;

      if (active) {
        setIsAdmin(profile?.role === "admin");
      }
    }

    loadAdminState().catch(() => {
      if (active) {
        setIsAdmin(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-rawey-line/70 bg-rawey-background/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.svg"
            alt="Rawey Logo"
            width={56}
            height={56}
          />
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Link href="/products" className="rounded-full px-4 py-2 transition hover:bg-white">
            المنتجات
          </Link>
          {isAdmin ? (
            <Link href="/admin" className="hidden rounded-full px-4 py-2 transition hover:bg-white sm:inline-flex">
              الإدارة
            </Link>
          ) : null}
          <Button asChild href="/cart" size="icon" variant="secondary" aria-label="السلة">
            <span className="relative">
              <ShoppingBag className="h-5 w-5" />
              {mounted && count > 0 ? (
                <span className="absolute -left-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rawey-gold px-1 text-[11px] font-bold text-rawey-text">
                  {count}
                </span>
              ) : null}
            </span>
          </Button>
        </div>
      </nav>
    </header>
  );
}
