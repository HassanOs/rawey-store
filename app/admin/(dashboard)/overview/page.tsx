import { BarChart3, Boxes, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { AdminDashboardCharts } from "@/components/organisms/admin-charts";
import {
  AdminPageHeader,
  AdminStatCard,
} from "@/components/organisms/admin-page-header";
import {
  shortId,
  StatusBadge,
} from "@/components/organisms/admin-dashboard-ui";
import {
  ADMIN_DASHBOARD_RANGES,
  getAdminDashboardData,
  getAdminStats,
  getRecentAdminOrders,
  normalizeAdminDashboardRange,
} from "@/lib/data/admin";
import { formatDate, formatPrice } from "@/lib/utils";

type AdminOverviewPageProps = {
  searchParams: Promise<{ range?: string }>;
};

export default async function AdminOverviewPage({
  searchParams,
}: AdminOverviewPageProps) {
  const { range: rangeParam } = await searchParams;
  const range = normalizeAdminDashboardRange(rangeParam);
  const dashboard = await getOverviewDashboard(range);

  if (!dashboard.ok) {
    return (
      <>
        <AdminPageHeader
          eyebrow="Overview"
          icon={<BarChart3 className="h-5 w-5" />}
          title="نظرة عامة"
          summary="تحليلات لوحة الإدارة تحتاج إلى تحديث قاعدة البيانات."
          actions={<RangeActions activeRange={range} />}
        />
        <section className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm">
          <h3 className="text-base font-bold">تحديث Supabase مطلوب</h3>
          <p className="mt-2">
            شغّل ملف <span className="font-semibold">supabase/schema.sql</span>{" "}
            في Supabase SQL Editor لتفعيل الرسوم البيانية، روابط المنتجات
            النظيفة، ودوال التحليلات.
          </p>
        </section>
      </>
    );
  }

  const { dashboardData, recentOrders, stats } = dashboard;

  return (
    <>
      <AdminPageHeader
        eyebrow="Overview"
        icon={<BarChart3 className="h-5 w-5" />}
        title="نظرة عامة"
        summary={`مؤشرات المتجر الأساسية وتحليلات آخر ${range} يوم.`}
        actions={<RangeActions activeRange={range} />}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          icon={<ShoppingBag className="h-4 w-4" />}
          label="إجمالي الطلبات"
          value={String(stats.totalOrders)}
        />
        <AdminStatCard
          icon={<Truck className="h-4 w-4" />}
          label="طلبات نشطة"
          value={String(stats.activeOrders)}
        />
        <AdminStatCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="الإيراد"
          value={formatPrice(stats.totalRevenue)}
        />
        <AdminStatCard
          icon={<Boxes className="h-4 w-4" />}
          label="المنتجات"
          value={String(stats.productCount)}
          note={`متوسط الطلب ${formatPrice(stats.averageOrder)}`}
        />
      </section>

      <AdminDashboardCharts
        range={dashboardData.range}
        revenueSeries={dashboardData.revenueSeries}
        statusBreakdown={dashboardData.statusBreakdown}
        paymentBreakdown={dashboardData.paymentBreakdown}
        topProducts={dashboardData.topProducts}
      />

      <section className="rounded-2xl border border-rawey-line bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold">أحدث الطلبات</h3>
          <p className="text-xs font-semibold text-rawey-muted">
            {stats.pendingOrders} قيد المتابعة
          </p>
        </div>
        <div className="mt-3 divide-y divide-rawey-line">
          {recentOrders.length ? (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center"
              >
                <div>
                  <p className="font-semibold">
                    {order.full_name || "طلب بدون اسم"}
                  </p>
                  <p className="text-xs text-rawey-muted">
                    #{shortId(order.id)} - {formatDate(order.created_at)}
                  </p>
                </div>
                <StatusBadge status={order.status} />
                <p className="font-semibold sm:text-left">
                  {formatPrice(order.total_price)}
                </p>
              </div>
            ))
          ) : (
            <p className="py-4 text-sm text-rawey-muted">لا يوجد نشاط حديث.</p>
          )}
        </div>
      </section>
    </>
  );
}

async function getOverviewDashboard(range: number) {
  try {
    const [stats, recentOrders, dashboardData] = await Promise.all([
      getAdminStats(),
      getRecentAdminOrders(5),
      getAdminDashboardData(range),
    ]);

    return {
      ok: true as const,
      stats,
      recentOrders,
      dashboardData,
    };
  } catch (error) {
    console.error("Failed to load admin overview dashboard:", error);
    return { ok: false as const };
  }
}

function RangeActions({ activeRange }: { activeRange: number }) {
  return (
    <div className="inline-flex rounded-full border border-rawey-line bg-white p-1 text-xs font-semibold shadow-sm">
      {ADMIN_DASHBOARD_RANGES.map((range) => (
        <Button
          key={range}
          asChild
          href={
            range === 30 ? "/admin/overview" : `/admin/overview?range=${range}`
          }
          variant={activeRange === range ? "primary" : "ghost"}
          size="sm"
          className="min-w-14"
        >
          {range} يوم
        </Button>
      ))}
    </div>
  );
}
