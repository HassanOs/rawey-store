import { describe, expect, it } from "vitest";
import {
  buildPagination,
  calculateAdminStats,
  normalizeAdminDashboardRange,
  normalizeAdminSearch,
  parseAdminPage
} from "@/lib/data/admin";

describe("calculateAdminStats", () => {
  it("calculates totals from already-fetched orders", () => {
    const stats = calculateAdminStats([
      { status: "pending", total_price: 10 },
      { status: "shipped", total_price: 20 },
      { status: "delivered", total_price: 30 }
    ]);

    expect(stats).toEqual({
      totalOrders: 3,
      totalRevenue: 60,
      pendingOrders: 1,
      deliveredOrders: 1
    });
  });

  it("normalizes pagination input and metadata", () => {
    expect(parseAdminPage("3")).toBe(3);
    expect(parseAdminPage("-1")).toBe(1);

    expect(buildPagination(["a", "b"], 23, 2, 10)).toEqual({
      items: ["a", "b"],
      page: 2,
      pageSize: 10,
      totalCount: 23,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true
    });
  });

  it("keeps admin search terms safe for PostgREST filter strings", () => {
    expect(normalizeAdminSearch("  rose, musk (gold)%  ")).toBe("rose musk gold");
  });

  it("normalizes dashboard chart ranges", () => {
    expect(normalizeAdminDashboardRange("7")).toBe(7);
    expect(normalizeAdminDashboardRange(90)).toBe(90);
    expect(normalizeAdminDashboardRange("365")).toBe(30);
  });
});
