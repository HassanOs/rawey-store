export type CartItem = {
  productId: string;
  slug?: string | null;
  brandSlug?: string | null;
  variantId: string;
  name: string;
  brand: string;
  imageUrl: string;
  sizeMl: number;
  price: number;
  quantity: number;
};
