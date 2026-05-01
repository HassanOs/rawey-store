export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          brand: string;
          description: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand: string;
          description: string;
          image_url: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size_ml: number;
          price: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          size_ml: number;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          full_name: string | null;
          phone_number: string | null;
          governorate: string | null;
          district_city: string | null;
          address_details: string | null;
          landmark: string | null;
          payment_method: "COD" | "WISH";
          shipping_price: number;
          total_price: number;
          status: "pending" | "shipped" | "delivered";
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone_number: string;
          governorate?: string | null;
          district_city?: string | null;
          address_details?: string | null;
          landmark?: string | null;
          payment_method: "COD" | "WISH";
          shipping_price: number;
          total_price: number;
          status?: "pending" | "shipped" | "delivered";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          quantity: number;
          price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          quantity: number;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          }
        ];
      };
      settings: {
        Row: {
          id: string;
          shipping_price: number;
        };
        Insert: {
          id?: string;
          shipping_price: number;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

export type OrderWithItems = Order & {
  items: Array<OrderItem & { product?: Product | null; variant?: ProductVariant | null }>;
};
