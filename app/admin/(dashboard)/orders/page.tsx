import { ClipboardList, Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Select } from "@/components/atoms/select";
import { AdminPageHeader } from "@/components/organisms/admin-page-header";
import { AdminPagination } from "@/components/organisms/admin-pagination";
import { OrdersTable } from "@/components/organisms/admin-orders-table";
import { getAdminOrdersPage, normalizeOrderStatusFilter, normalizePaymentMethodFilter, parseAdminPage } from "@/lib/data/admin";

type AdminOrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const filters = {
    status: singleParam(params.status),
    paymentMethod: singleParam(params.payment),
    search: singleParam(params.search),
    dateFrom: singleParam(params.from),
    dateTo: singleParam(params.to)
  };
  const page = parseAdminPage(singleParam(params.page));
  const orders = await getAdminOrdersPage(filters, page);
  const queryParams = flattenSearchParams(params);

  return (
    <>
      <AdminPageHeader
        icon={<ClipboardList className="h-5 w-5" />}
        title="الطلبات"
        summary={`${orders.totalCount} طلب مطابق`}
      />

      <form action="/admin/orders" className="w-full rounded-2xl border border-rawey-line bg-white p-4 shadow-sm">
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_minmax(160px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)]">
          <label className="min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-rawey-muted">
              <Search className="h-4 w-4 text-rawey-gold" />
              بحث
            </span>
            <Input name="search" defaultValue={filters.search} placeholder="اسم، هاتف، منطقة" />
          </label>
          <label className="min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-rawey-muted">
              <Filter className="h-4 w-4 text-rawey-gold" />
              الحالة
            </span>
            <Select name="status" defaultValue={normalizeOrderStatusFilter(filters.status)}>
              <option value="active">نشطة</option>
              <option value="all">كل الطلبات</option>
              <option value="pending">قيد المتابعة</option>
              <option value="shipped">تم الشحن</option>
              <option value="delivered">تم التسليم</option>
            </Select>
          </label>
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-semibold text-rawey-muted">الدفع</span>
            <Select name="payment" defaultValue={normalizePaymentMethodFilter(filters.paymentMethod)}>
              <option value="all">كل الطرق</option>
              <option value="COD">عند الاستلام</option>
              <option value="WISH">Wish</option>
            </Select>
          </label>
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-semibold text-rawey-muted">من</span>
            <Input name="from" type="date" defaultValue={filters.dateFrom} />
          </label>
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-semibold text-rawey-muted">إلى</span>
            <Input name="to" type="date" defaultValue={filters.dateTo} />
          </label>
        </div>
        <div className="mt-4 flex w-full flex-col gap-2 border-t border-rawey-line pt-4 sm:flex-row sm:justify-end">
          <Button type="submit" className="w-full sm:w-auto">تصفية</Button>
          <Button asChild href="/admin/orders" variant="secondary" className="w-full sm:w-auto">
            <RotateCcw className="h-4 w-4" />
            إعادة
          </Button>
        </div>
      </form>

      <OrdersTable orders={orders.items} />
      <AdminPagination basePath="/admin/orders" pagination={orders} searchParams={queryParams} />
    </>
  );
}

function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function flattenSearchParams(params: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, singleParam(value)])
  ) as Record<string, string | undefined>;
}
