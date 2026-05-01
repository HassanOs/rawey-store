"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/atoms/input";

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateSearch(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("search", value);
    else next.delete("search");

    startTransition(() => {
      router.push(`/products?${next.toString()}`);
    });
  }

  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rawey-muted" />
      <Input
        defaultValue={params.get("search") || ""}
        onChange={(event) => updateSearch(event.target.value)}
        placeholder="ابحث عن عطر أو علامة"
        className="pr-11"
        aria-busy={isPending}
      />
    </label>
  );
}
