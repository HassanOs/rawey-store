import { ArrowRight, PackagePlus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { AdminPageHeader } from "@/components/organisms/admin-page-header";
import { AdminProductForm } from "@/components/organisms/admin-product-form";
import { createProduct } from "@/app/admin/actions";

export default function NewAdminProductPage() {
  return (
    <>
      <AdminPageHeader
        icon={<PackagePlus className="h-5 w-5" />}
        title="إضافة منتج"
        actions={(
          <Button asChild href="/admin/products" variant="secondary">
            <ArrowRight className="h-4 w-4" />
            المنتجات
          </Button>
        )}
      />

      <div className="w-full">
        <AdminProductForm action={createProduct} />
      </div>
    </>
  );
}
