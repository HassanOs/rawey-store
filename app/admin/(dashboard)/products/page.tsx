export const dynamic = "force-dynamic";
export const revalidate = 0;

import {
  Boxes,
  PackagePlus,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Select } from "@/components/atoms/select";
import { AdminPagination } from "@/components/organisms/admin-pagination";
import { AdminPageHeader } from "@/components/organisms/admin-page-header";
import { InventoryTable } from "@/components/organisms/admin-inventory-table";
import {
  ADMIN_PRODUCTS_PAGE_SIZE,
  getAdminBrands,
  getAdminProductsPage,
  normalizeProductSort,
  parseAdminPage,
  PaginatedResult,
} from "@/lib/data/admin";
import type { ProductWithVariants } from "@/types/database";

type AdminProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const filters = {
    search: singleParam(params.search),
    brand: singleParam(params.brand),
    sort: singleParam(params.sort),
  };
  const page = parseAdminPage(singleParam(params.page));
  let products: PaginatedResult<ProductWithVariants> = {
    items: [],
    page,
    pageSize: ADMIN_PRODUCTS_PAGE_SIZE,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  let brands: string[] = [];

  try {
    [products, brands] = await Promise.all([
      getAdminProductsPage(filters, page),
      getAdminBrands(),
    ]);
  } catch (error) {
    console.error("Failed to load admin products page:", error);
  }

  const queryParams = flattenSearchParams(params);

  return (
    <>
      <AdminPageHeader
        icon={<Boxes className="h-5 w-5" />}
        title="المنتجات"
        summary={`${products.totalCount} منتج مطابق`}
        actions={
          <Button asChild href="/admin/products/new">
            <PackagePlus className="h-4 w-4" />
            إضافة منتج
          </Button>
        }
      />

      <form
        action="/admin/products"
        className="w-full rounded-2xl border border-rawey-line bg-white p-4 shadow-sm"
      >
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.6fr)_minmax(180px,1fr)_minmax(170px,1fr)]">
          <label className="min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-rawey-muted">
              <Search className="h-4 w-4 text-rawey-gold" />
              بحث
            </span>
            <Input
              name="search"
              defaultValue={filters.search}
              placeholder="منتج أو علامة"
            />
          </label>
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-semibold text-rawey-muted">
              العلامة
            </span>
            <Select name="brand" defaultValue={filters.brand || ""}>
              <option value="">كل العلامات</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </Select>
          </label>
          <label className="min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-rawey-muted">
              <SlidersHorizontal className="h-4 w-4 text-rawey-gold" />
              الترتيب
            </span>
            <Select
              name="sort"
              defaultValue={normalizeProductSort(filters.sort)}
            >
              <option value="newest">الأحدث</option>
              <option value="oldest">الأقدم</option>
              <option value="name">الاسم</option>
              <option value="brand">العلامة</option>
            </Select>
          </label>
        </div>
        <div className="mt-4 flex w-full flex-col gap-2 border-t border-rawey-line pt-4 sm:flex-row sm:justify-end">
          <Button type="submit" className="w-full sm:w-auto">
            تصفية
          </Button>
          <Button
            asChild
            href="/admin/products"
            variant="secondary"
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            إعادة
          </Button>
        </div>
      </form>

      <InventoryTable products={products.items} />
      <AdminPagination
        basePath="/admin/products"
        pagination={products}
        searchParams={queryParams}
      />
    </>
  );
}

function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function flattenSearchParams(
  params: Record<string, string | string[] | undefined>,
) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, singleParam(value)]),
  ) as Record<string, string | undefined>;
}
