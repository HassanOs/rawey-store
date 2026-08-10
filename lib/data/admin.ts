import {
  isAllowedProductSize,
  withoutDroppedVariants,
} from "@/lib/product-variants";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type {
  Order,
  OrderWithItems,
  ProductWithVariants,
} from "@/types/database";

export const ADMIN_ORDERS_PAGE_SIZE = 10;
export const ADMIN_PRODUCTS_PAGE_SIZE = 10;
export const ADMIN_DASHBOARD_RANGES = [7, 30, 90] as const;

const ORDER_STATUSES = ["pending", "shipped", "delivered"] as const;
const ORDER_STATUS_FILTERS = ["all", "active", ...ORDER_STATUSES] as const;
const PAYMENT_METHODS = ["COD", "WISH"] as const;
const PRODUCT_SORTS = ["newest", "oldest", "name", "brand"] as const;
const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "قيد المتابعة",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
};
const paymentMethodLabels: Record<"COD" | "WISH", string> = {
  COD: "عند الاستلام",
  WISH: "Wish",
};

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type AdminOrderStatusFilter = (typeof ORDER_STATUS_FILTERS)[number];
export type AdminPaymentMethodFilter = (typeof PAYMENT_METHODS)[number] | "all";
export type AdminProductSort = (typeof PRODUCT_SORTS)[number];
export type AdminDashboardRange = (typeof ADMIN_DASHBOARD_RANGES)[number];

export type AdminStats = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  productCount: number;
  activeOrders: number;
  averageOrder: number;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AdminOrdersFilters = {
  status?: string;
  paymentMethod?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type AdminProductsFilters = {
  search?: string;
  brand?: string;
  sort?: string;
};

export type RecentAdminOrder = Pick<
  Order,
  "id" | "full_name" | "status" | "total_price" | "created_at"
>;

export type AdminRevenuePoint = {
  day: string;
  totalOrders: number;
  totalRevenue: number;
};

export type AdminBreakdownPoint = {
  key: string;
  label: string;
  totalOrders: number;
  totalRevenue: number;
};

export type AdminTopProductPoint = {
  productId: string;
  name: string;
  brand: string;
  brandSlug: string;
  imageUrl: string;
  slug: string;
  unitsSold: number;
  revenue: number;
};

export type AdminDashboardData = {
  range: AdminDashboardRange;
  revenueSeries: AdminRevenuePoint[];
  statusBreakdown: AdminBreakdownPoint[];
  paymentBreakdown: AdminBreakdownPoint[];
  topProducts: AdminTopProductPoint[];
};

type AdminStatsRpcRow = {
  total_orders: number | string | null;
  total_revenue: number | string | null;
  pending_orders: number | string | null;
  delivered_orders: number | string | null;
  product_count: number | string | null;
};

type AdminRevenueSeriesRow = {
  day: string;
  total_orders: number | string | null;
  total_revenue: number | string | null;
};

type AdminStatusBreakdownRow = {
  status: OrderStatus;
  total_orders: number | string | null;
  total_revenue: number | string | null;
};

type AdminPaymentBreakdownRow = {
  payment_method: "COD" | "WISH";
  total_orders: number | string | null;
  total_revenue: number | string | null;
};

type AdminTopProductRow = {
  product_id: string;
  name: string;
  brand: string;
  brand_slug: string;
  image_url: string;
  slug: string;
  units_sold: number | string | null;
  revenue: number | string | null;
};

type QueryPage = {
  from: number;
  page: number;
  pageSize: number;
  to: number;
};

export function normalizeAdminSearch(value?: string) {
  const search = (value || "")
    .trim()
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return search.length > 80 ? search.slice(0, 80).trim() : search;
}

export function parseAdminPage(value?: string | number, fallback = 1) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : fallback;
}

export function normalizeOrderStatusFilter(
  value?: string,
): AdminOrderStatusFilter {
  return ORDER_STATUS_FILTERS.includes(value as AdminOrderStatusFilter)
    ? (value as AdminOrderStatusFilter)
    : "active";
}

export function normalizePaymentMethodFilter(
  value?: string,
): AdminPaymentMethodFilter {
  return (PAYMENT_METHODS as readonly string[]).includes(value || "")
    ? (value as AdminPaymentMethodFilter)
    : "all";
}

export function normalizeProductSort(value?: string): AdminProductSort {
  return PRODUCT_SORTS.includes(value as AdminProductSort)
    ? (value as AdminProductSort)
    : "newest";
}

export function normalizeAdminDashboardRange(
  value?: string | number,
): AdminDashboardRange {
  const range = Number(value);
  return ADMIN_DASHBOARD_RANGES.includes(range as AdminDashboardRange)
    ? (range as AdminDashboardRange)
    : 30;
}

export function buildPagination<T>(
  items: T[],
  count: number | null,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const totalCount = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.rpc("get_admin_overview_stats");

    if (error) {
      return normalizeStats({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        productCount: 0,
      });
    }

    if (!data?.[0]) {
      return normalizeStats({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        productCount: 0,
      });
    }

    return normalizeAdminStats(data[0] as AdminStatsRpcRow);
  } catch {
    return normalizeStats({
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      productCount: 0,
    });
  }
}

export async function getRecentAdminOrders(
  limit = 5,
): Promise<RecentAdminOrder[]> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("orders")
      .select("id, full_name, status, total_price, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    return (data || []) as RecentAdminOrder[];
  } catch {
    return [];
  }
}

export async function getAdminDashboardData(
  rangeValue?: string | number,
): Promise<AdminDashboardData> {
  const range = normalizeAdminDashboardRange(rangeValue);

  try {
    const supabase = createServiceRoleClient();
    const [revenueSeries, statusBreakdown, paymentBreakdown, topProducts] =
      await Promise.all([
        supabase.rpc("get_admin_revenue_series", { range_days: range }),
        supabase.rpc("get_admin_status_breakdown", { range_days: range }),
        supabase.rpc("get_admin_payment_breakdown", { range_days: range }),
        supabase.rpc("get_admin_top_products", {
          range_days: range,
          result_limit: 5,
        }),
      ]);

    const results = [
      revenueSeries,
      statusBreakdown,
      paymentBreakdown,
      topProducts,
    ];

    if (results.some((result) => result.error)) {
      return {
        range,
        revenueSeries: [],
        statusBreakdown: [],
        paymentBreakdown: [],
        topProducts: [],
      };
    }

    return {
      range,
      revenueSeries: (
        (revenueSeries.data || []) as AdminRevenueSeriesRow[]
      ).map((point) => ({
        day: point.day,
        totalOrders: Number(point.total_orders || 0),
        totalRevenue: Number(point.total_revenue || 0),
      })),
      statusBreakdown: (
        (statusBreakdown.data || []) as AdminStatusBreakdownRow[]
      ).map((point) => ({
        key: point.status,
        label: orderStatusLabels[point.status],
        totalOrders: Number(point.total_orders || 0),
        totalRevenue: Number(point.total_revenue || 0),
      })),
      paymentBreakdown: (
        (paymentBreakdown.data || []) as AdminPaymentBreakdownRow[]
      ).map((point) => ({
        key: point.payment_method,
        label: paymentMethodLabels[point.payment_method],
        totalOrders: Number(point.total_orders || 0),
        totalRevenue: Number(point.total_revenue || 0),
      })),
      topProducts: ((topProducts.data || []) as AdminTopProductRow[]).map(
        (product) => ({
          productId: product.product_id,
          name: product.name,
          brand: product.brand,
          brandSlug: product.brand_slug,
          imageUrl: product.image_url,
          slug: product.slug,
          unitsSold: Number(product.units_sold || 0),
          revenue: Number(product.revenue || 0),
        }),
      ),
    };
  } catch {
    return {
      range,
      revenueSeries: [],
      statusBreakdown: [],
      paymentBreakdown: [],
      topProducts: [],
    };
  }
}

export async function getAdminOrdersPage(
  filters: AdminOrdersFilters = {},
  page = 1,
  pageSize = ADMIN_ORDERS_PAGE_SIZE,
): Promise<PaginatedResult<OrderWithItems>> {
  const supabase = createServiceRoleClient();
  const paging = getQueryPage(page, pageSize);
  const status = normalizeOrderStatusFilter(filters.status);
  const paymentMethod = normalizePaymentMethodFilter(filters.paymentMethod);
  const search = normalizeAdminSearch(filters.search);
  const dateFrom = normalizeDate(filters.dateFrom);
  const dateTo = normalizeDate(filters.dateTo, true);
  let query = supabase
    .from("orders")
    .select(
      "*, items:order_items(*, product:products(*), variant:product_variants(*))",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(paging.from, paging.to);

  if (status === "active") {
    query = query.neq("status", "delivered");
  } else if (status !== "all") {
    query = query.eq("status", status);
  }

  if (paymentMethod !== "all") {
    query = query.eq("payment_method", paymentMethod);
  }

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,phone_number.ilike.%${search}%,governorate.ilike.%${search}%,district_city.ilike.%${search}%`,
    );
  }

  if (dateFrom) {
    query = query.gte("created_at", dateFrom);
  }

  if (dateTo) {
    query = query.lte("created_at", dateTo);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const orders = ((data || []) as OrderWithItems[]).map((order) => ({
    ...order,
    items: order.items.filter(
      (item) => !item.variant || isAllowedProductSize(item.variant.size_ml),
    ),
  }));

  return buildPagination(orders, count, paging.page, paging.pageSize);
}

export async function getAdminProductsPage(
  filters: AdminProductsFilters = {},
  page = 1,
  pageSize = ADMIN_PRODUCTS_PAGE_SIZE,
): Promise<PaginatedResult<ProductWithVariants>> {
  const supabase = createServiceRoleClient();
  const paging = getQueryPage(page, pageSize);
  const search = normalizeAdminSearch(filters.search);
  const sort = normalizeProductSort(filters.sort);
  const brand = (filters.brand || "").trim();
  let query = supabase
    .from("products")
    .select("*, variants:product_variants(*)", { count: "exact" })
    .neq("variants.size_ml", 1)
    .range(paging.from, paging.to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
  }

  if (brand) {
    query = query.eq("brand", brand);
  }

  if (sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (sort === "name") {
    query = query.order("name", { ascending: true });
  } else if (sort === "brand") {
    query = query
      .order("brand", { ascending: true })
      .order("name", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const products = (data || [])
    .map(withoutDroppedVariants)
    .filter((product) => product.variants.length);
  return buildPagination(products, count, paging.page, paging.pageSize);
}

export async function getAdminBrands() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("products")
    .select("brand")
    .order("brand", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return Array.from(
    new Set((data || []).map((item) => item.brand).filter(Boolean)),
  );
}

export async function getAdminOrders(): Promise<OrderWithItems[]> {
  const firstPage = await getAdminOrdersPage({ status: "all" }, 1, 500);
  return firstPage.items;
}

export function calculateAdminStats(
  orders: Pick<OrderWithItems, "status" | "total_price">[],
) {
  const totalRevenue = orders.reduce(
    (total, order) => total + order.total_price,
    0,
  );
  const pendingOrders = orders.filter(
    (order) => order.status === "pending",
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered",
  ).length;

  return {
    totalOrders: orders.length,
    totalRevenue,
    pendingOrders,
    deliveredOrders,
  };
}

function getQueryPage(page: number, pageSize: number): QueryPage {
  const safePage = parseAdminPage(page);
  const safePageSize = Math.min(Math.max(pageSize, 1), 100);
  const from = (safePage - 1) * safePageSize;

  return {
    from,
    page: safePage,
    pageSize: safePageSize,
    to: from + safePageSize - 1,
  };
}

function normalizeDate(value?: string, endOfDay = false) {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setHours(
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0,
    );
  }

  return date.toISOString();
}

function normalizeAdminStats(row: AdminStatsRpcRow): AdminStats {
  return normalizeStats({
    totalOrders: Number(row.total_orders || 0),
    totalRevenue: Number(row.total_revenue || 0),
    pendingOrders: Number(row.pending_orders || 0),
    deliveredOrders: Number(row.delivered_orders || 0),
    productCount: Number(row.product_count || 0),
  });
}

function normalizeStats(
  stats: Omit<AdminStats, "activeOrders" | "averageOrder">,
): AdminStats {
  return {
    ...stats,
    activeOrders: Math.max(stats.totalOrders - stats.deliveredOrders, 0),
    averageOrder: stats.totalOrders
      ? stats.totalRevenue / stats.totalOrders
      : 0,
  };
}
