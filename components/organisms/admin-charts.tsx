import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, CreditCard, Package, TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/organisms/admin-dashboard-ui";
import { productPath } from "@/lib/products/slug";
import { formatDate, formatPrice } from "@/lib/utils";
import type {
  AdminBreakdownPoint,
  AdminDashboardRange,
  AdminRevenuePoint,
  AdminTopProductPoint
} from "@/lib/data/admin";

export function AdminDashboardCharts({
  paymentBreakdown,
  range,
  revenueSeries,
  statusBreakdown,
  topProducts
}: {
  paymentBreakdown: AdminBreakdownPoint[];
  range: AdminDashboardRange;
  revenueSeries: AdminRevenuePoint[];
  statusBreakdown: AdminBreakdownPoint[];
  topProducts: AdminTopProductPoint[];
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
      <RevenueTrendChart data={revenueSeries} range={range} />
      <div className="grid gap-4">
        <BreakdownChart
          icon={<BarChart3 className="h-4 w-4" />}
          title="حالة الطلبات"
          data={statusBreakdown}
        />
        <BreakdownChart
          icon={<CreditCard className="h-4 w-4" />}
          title="طرق الدفع"
          data={paymentBreakdown}
        />
      </div>
      <TopProductsChart products={topProducts} />
    </section>
  );
}

function RevenueTrendChart({ data, range }: { data: AdminRevenuePoint[]; range: AdminDashboardRange }) {
  const width = 640;
  const height = 250;
  const padding = 28;
  const maxRevenue = Math.max(...data.map((point) => point.totalRevenue), 0);
  const maxOrders = Math.max(...data.map((point) => point.totalOrders), 0);
  const totalRevenue = data.reduce((total, point) => total + point.totalRevenue, 0);
  const totalOrders = data.reduce((total, point) => total + point.totalOrders, 0);
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const linePoints = data.map((point, index) => {
    const x = padding + (data.length <= 1 ? 0 : (index / (data.length - 1)) * chartWidth);
    const y = padding + chartHeight - (maxRevenue ? (point.totalRevenue / maxRevenue) * chartHeight : 0);
    return `${x},${y}`;
  }).join(" ");

  return (
    <article className="rounded-2xl border border-rawey-line bg-white p-4 shadow-sm xl:row-span-2">
      <ChartHeader
        icon={<TrendingUp className="h-4 w-4" />}
        title="الإيراد والطلبات"
        meta={`آخر ${range} يوم`}
      />
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <MiniMetric label="الإيراد" value={formatPrice(totalRevenue)} />
        <MiniMetric label="الطلبات" value={String(totalOrders)} />
      </div>
      {data.some((point) => point.totalOrders || point.totalRevenue) ? (
        <div className="mt-5 overflow-hidden rounded-xl bg-rawey-background/60 p-3">
          <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Revenue and orders trend" className="h-[260px] w-full">
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d9d4ca" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d9d4ca" />
            {data.map((point, index) => {
              const barWidth = Math.max(4, chartWidth / Math.max(data.length, 1) - 4);
              const x = padding + (index / Math.max(data.length, 1)) * chartWidth + 2;
              const barHeight = maxOrders ? (point.totalOrders / maxOrders) * chartHeight : 0;
              return (
                <rect
                  key={point.day}
                  x={x}
                  y={height - padding - barHeight}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill="#c9a96a"
                  opacity="0.28"
                />
              );
            })}
            <polyline points={linePoints} fill="none" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {data.map((point, index) => {
              const x = padding + (data.length <= 1 ? 0 : (index / (data.length - 1)) * chartWidth);
              const y = padding + chartHeight - (maxRevenue ? (point.totalRevenue / maxRevenue) * chartHeight : 0);
              return <circle key={`${point.day}-dot`} cx={x} cy={y} r="4" fill="#1a1a1a" />;
            })}
          </svg>
          <div className="mt-2 flex justify-between text-xs font-semibold text-rawey-muted">
            <span>{data[0] ? formatDate(data[0].day) : "-"}</span>
            <span>{data[data.length - 1] ? formatDate(data[data.length - 1].day) : "-"}</span>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState>لا توجد طلبات ضمن هذا النطاق.</EmptyState>
        </div>
      )}
    </article>
  );
}

function BreakdownChart({ data, icon, title }: { data: AdminBreakdownPoint[]; icon: ReactNode; title: string }) {
  const maxOrders = Math.max(...data.map((point) => point.totalOrders), 0);

  return (
    <article className="rounded-2xl border border-rawey-line bg-white p-4 shadow-sm">
      <ChartHeader icon={icon} title={title} />
      <div className="mt-4 space-y-3">
        {data.map((point) => (
          <div key={point.key}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{point.label}</span>
              <span className="text-xs text-rawey-muted">{point.totalOrders} طلب</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-rawey-background">
              <div
                className="h-full rounded-full bg-rawey-gold"
                style={{ width: `${maxOrders ? Math.max((point.totalOrders / maxOrders) * 100, point.totalOrders ? 6 : 0) : 0}%` }}
              />
            </div>
            <p className="mt-1 text-xs font-semibold text-rawey-muted">{formatPrice(point.totalRevenue)}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function TopProductsChart({ products }: { products: AdminTopProductPoint[] }) {
  const maxRevenue = Math.max(...products.map((product) => product.revenue), 0);

  return (
    <article className="rounded-2xl border border-rawey-line bg-white p-4 shadow-sm xl:col-span-2">
      <ChartHeader icon={<Package className="h-4 w-4" />} title="أفضل المنتجات" />
      {products.length ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {products.map((product, index) => (
            <Link
              key={product.productId}
              href={productPath({
                id: product.productId,
                name: product.name,
                brand: product.brand,
                brand_slug: product.brandSlug,
                slug: product.slug
              })}
              className="group rounded-xl border border-rawey-line p-3 transition hover:border-rawey-gold"
            >
              <div className="flex gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-rawey-background">
                  <div className="absolute inset-1.5">
                    <Image src={product.imageUrl} alt={product.name} fill sizes="56px" className="object-contain" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rawey-text text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold group-hover:text-rawey-gold">{product.name}</p>
                      <p className="text-xs text-rawey-muted">{product.brand}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-rawey-background">
                    <div
                      className="h-full rounded-full bg-rawey-gold"
                      style={{ width: `${maxRevenue ? Math.max((product.revenue / maxRevenue) * 100, 8) : 0}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-rawey-muted">
                    {product.unitsSold} وحدة - {formatPrice(product.revenue)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState>لا توجد مبيعات منتجات ضمن هذا النطاق.</EmptyState>
        </div>
      )}
    </article>
  );
}

function ChartHeader({ icon, meta, title }: { icon: ReactNode; meta?: string; title: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 text-base font-bold">
        <span className="rounded-full bg-rawey-gold/10 p-2 text-rawey-gold">{icon}</span>
        {title}
      </h3>
      {meta ? <p className="text-xs font-semibold text-rawey-muted">{meta}</p> : null}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-rawey-background/70 p-3">
      <p className="text-xs text-rawey-muted">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
