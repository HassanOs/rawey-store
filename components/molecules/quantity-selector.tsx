"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
};

export function QuantitySelector({ value, onChange }: QuantitySelectorProps) {
  return (
    <div className="inline-flex h-11 items-center rounded-full border border-rawey-line bg-white">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="إنقاص الكمية"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="h-10 w-10"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-10 text-center text-sm font-semibold">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="زيادة الكمية"
        onClick={() => onChange(value + 1)}
        className="h-10 w-10"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
