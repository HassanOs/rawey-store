import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: false;
};

type LinkButtonProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  asChild: true;
  children: ReactNode;
};

const variants = {
  primary: "bg-rawey-text text-white hover:bg-black",
  secondary: "border border-rawey-line bg-white text-rawey-text hover:border-rawey-gold",
  ghost: "bg-transparent text-rawey-text hover:bg-white",
  danger: "bg-red-600 text-white hover:bg-red-700"
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0"
};

export function Button(props: ButtonProps | LinkButtonProps) {
  const { className, variant = "primary", size = "md", asChild, ...rest } = props;
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );

  if (asChild) {
    const linkProps = rest as ComponentPropsWithoutRef<typeof Link>;
    return <Link className={classes} {...linkProps} />;
  }

  return <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} />;
}
