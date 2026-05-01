"use client";

import { useState } from "react";
import { Plus, Trash2, Upload, Loader } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input, Textarea } from "@/components/atoms/input";
import { uploadProductImage } from "@/lib/utils/image-upload";
import type { ProductWithVariants } from "@/types/database";

type AdminProductFormProps = {
  product?: ProductWithVariants;
  action: (formData: FormData) => void | Promise<void>;
};

const defaultVariants = [1, 3, 5, 10].map((size) => ({
  id: "",
  size_ml: size,
  price: ""
}));

export function AdminProductForm({ product, action }: AdminProductFormProps) {
  const [variants, setVariants] = useState(
    product?.variants.map((variant) => ({
      id: variant.id,
      size_ml: variant.size_ml,
      price: String(variant.price)
    })) || defaultVariants
  );
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const url = await uploadProductImage(file);
      setImageUrl(url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form action={action} className="space-y-4 rounded-[2rem] border border-rawey-line bg-white p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-xs font-semibold">اسم المنتج</span>
          <Input name="name" defaultValue={product?.name} required />
        </label>
        <label>
          <span className="mb-2 block text-xs font-semibold">العلامة</span>
          <Input name="brand" defaultValue={product?.brand} required />
        </label>
      </div>
      <label>
        <span className="mb-2 block text-xs font-semibold">صورة المنتج</span>
        <div className="flex flex-col gap-3">
          <div className="relative flex items-center justify-center rounded-lg border-2 border-dashed border-rawey-line bg-rawey-background/50 p-6 transition hover:border-rawey-gold">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="تحميل صورة المنتج"
            />
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              {isUploading ? (
                <>
                  <Loader className="h-6 w-6 animate-spin text-rawey-gold" />
                  <span className="text-xs text-rawey-muted">جاري التحميل...</span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-rawey-muted" />
                  <span className="text-xs text-rawey-muted">اسحب الصورة أو انقر للاختيار</span>
                </>
              )}
            </div>
          </div>
          {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
          {imageUrl && (
            <div className="flex gap-3">
              <img
                src={imageUrl}
                alt="Product preview"
                className="h-20 w-20 rounded-lg border border-rawey-line object-cover"
              />
              <div className="flex flex-col justify-center gap-1">
                <p className="text-xs font-semibold text-rawey-text">الصورة جاهزة</p>
                <p className="break-all text-[10px] text-rawey-muted">{imageUrl}</p>
              </div>
            </div>
          )}
        </div>
        <input type="hidden" name="image_url" value={imageUrl} />
      </label>
      <label>
        <span className="mb-2 block text-xs font-semibold">الوصف</span>
        <Textarea name="description" defaultValue={product?.description} required />
      </label>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold">الأحجام والأسعار</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setVariants((current) => [...current, { id: "", size_ml: 1, price: "" }])}
          >
            <Plus className="h-4 w-4" />
            حجم
          </Button>
        </div>
        <div className="space-y-2">
          {variants.map((variant, index) => (
            <div key={`${variant.id}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input type="hidden" name="variant_id" value={variant.id} />
              <Input
                name="size_ml"
                type="number"
                min="1"
                defaultValue={variant.size_ml}
                placeholder="ml"
                required
              />
              <Input name="price" type="number" min="0" step="0.01" defaultValue={variant.price} placeholder="USD" required />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="حذف الحجم"
                onClick={() => setVariants((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full">
        {product ? "حفظ التعديلات" : "إضافة المنتج"}
      </Button>
    </form>
  );
}
