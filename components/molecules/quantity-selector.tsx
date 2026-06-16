"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
};

export function QuantitySelector({ value, onChange }: QuantitySelectorProps) {
  return (
    <div className="inline-flex h-12 items-center rounded-full border border-[#E6DCC6] bg-white shadow-[0_6px_16px_rgba(26,26,26,0.05)]">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="إنقاص الكمية"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="h-11 w-11"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-7 text-center text-sm font-bold">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="زيادة الكمية"
        onClick={() => onChange(value + 1)}
        className="h-11 w-11"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
