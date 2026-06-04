import { describe, expect, it } from "vitest";
import { checkoutSchema, productFormSchema } from "@/lib/validations";

describe("checkoutSchema", () => {
  it("normalizes Lebanese mobile numbers", () => {
    const result = checkoutSchema.parse({
      full_name: "Hassan Osman",
      phone: "76 519 756",
      governorate: "بيروت",
      district_city: "بيروت",
      address_details: "شارع الحمرا، بناية 10",
      landmark: "قرب البنك",
      payment_method: "WISH"
    });

    expect(result.phone).toBe("+96176519756");
  });

  it("rejects unsupported payment methods", () => {
    const result = checkoutSchema.safeParse({
      full_name: "Hassan Osman",
      phone: "76519756",
      governorate: "بيروت",
      district_city: "بيروت",
      address_details: "شارع الحمرا، بناية 10",
      landmark: "قرب البنك",
      payment_method: "CARD"
    });

    expect(result.success).toBe(false);
  });
});

describe("productFormSchema", () => {
  it("rejects unsupported product sizes", () => {
    const result = productFormSchema.safeParse({
      name: "Sample Perfume",
      brand: "Rawey",
      description: "A valid product description.",
      image_url: "https://example.com/image.jpg",
      variants: [{ size_ml: 1, price: 4 }]
    });

    expect(result.success).toBe(false);
  });
});
