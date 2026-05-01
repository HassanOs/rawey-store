import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-rawey-line bg-white px-4 text-sm text-rawey-text outline-none transition placeholder:text-rawey-muted focus:border-rawey-gold focus:ring-4 focus:ring-rawey-gold/15",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-rawey-line bg-white px-4 py-3 text-sm text-rawey-text outline-none transition placeholder:text-rawey-muted focus:border-rawey-gold focus:ring-4 focus:ring-rawey-gold/15",
        className
      )}
      {...props}
    />
  );
}
