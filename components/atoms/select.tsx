import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-2xl border border-rawey-line bg-white px-4 text-sm text-rawey-text outline-none transition focus:border-rawey-gold focus:ring-4 focus:ring-rawey-gold/15",
        className
      )}
      {...props}
    />
  );
}
