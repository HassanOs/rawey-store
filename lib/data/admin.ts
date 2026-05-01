import { createServerClient } from "@/lib/supabase/server";
import type { OrderWithItems } from "@/types/database";

export async function getAdminOrders(): Promise<OrderWithItems[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*), variant:product_variants(*))")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as OrderWithItems[];
}

export async function getStats() {
  const orders = await getAdminOrders();
  const totalRevenue = orders.reduce((total, order) => total + order.total_price, 0);
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const deliveredOrders = orders.filter((order) => order.status === "delivered").length;

  return {
    totalOrders: orders.length,
    totalRevenue,
    pendingOrders,
    deliveredOrders
  };
}
