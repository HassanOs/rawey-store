import { describe, expect, it } from "vitest";
import { stringifyJsonLd } from "@/lib/seo/json-ld";

describe("stringifyJsonLd", () => {
  it("escapes less-than characters before embedding in script tags", () => {
    const json = stringifyJsonLd({ name: "</script><script>alert(1)</script>" });

    expect(json).not.toContain("</script>");
    expect(json).toContain("\\u003c/script>");
  });
});
