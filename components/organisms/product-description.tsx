"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";

export function ProductDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="border-t border-rawey-line pt-5">
      <h2 className="text-sm font-semibold">Description</h2>
      <p className={expanded ? "mt-3 leading-7 text-rawey-muted" : "mt-3 line-clamp-3 leading-7 text-rawey-muted"}>
        {description}
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2 px-0 text-rawey-gold hover:bg-transparent"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        {expanded ? "Show less" : "Show more"}
      </Button>
    </section>
  );
}
