import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/atoms/button";
import type { PaginatedResult } from "@/lib/data/admin";
import { cn } from "@/lib/utils";

type AdminPaginationProps = {
  basePath: string;
  pagination: Pick<PaginatedResult<unknown>, "hasNextPage" | "hasPreviousPage" | "page" | "pageSize" | "totalCount" | "totalPages">;
  searchParams: Record<string, string | undefined>;
};

export function AdminPagination({ basePath, pagination, searchParams }: AdminPaginationProps) {
  if (pagination.totalCount <= pagination.pageSize && pagination.page === 1) {
    return null;
  }

  const firstItem = pagination.totalCount ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  const lastItem = Math.min(pagination.page * pagination.pageSize, pagination.totalCount);

  return (
    <nav className="flex flex-col gap-3 rounded-2xl border border-rawey-line bg-white p-4 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="font-semibold">
        {firstItem}-{lastItem} من {pagination.totalCount}
      </p>
      <div className="flex items-center gap-2">
        <PaginationButton
          href={pageHref(basePath, searchParams, pagination.page - 1)}
          disabled={!pagination.hasPreviousPage}
          label="السابق"
          icon={<ChevronRight className="h-4 w-4" />}
        />
        <span className="min-w-24 text-center text-xs font-semibold text-rawey-muted">
          صفحة {pagination.page} من {pagination.totalPages}
        </span>
        <PaginationButton
          href={pageHref(basePath, searchParams, pagination.page + 1)}
          disabled={!pagination.hasNextPage}
          label="التالي"
          icon={<ChevronLeft className="h-4 w-4" />}
          iconAfter
        />
      </div>
    </nav>
  );
}

function PaginationButton({
  disabled,
  href,
  icon,
  iconAfter,
  label
}: {
  disabled: boolean;
  href: string;
  icon: ReactNode;
  iconAfter?: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span
        className={cn(
          "inline-flex h-9 items-center justify-center gap-2 rounded-full border border-rawey-line bg-white px-4 text-sm font-semibold text-rawey-muted opacity-60"
        )}
      >
        {!iconAfter ? icon : null}
        {label}
        {iconAfter ? icon : null}
      </span>
    );
  }

  return (
    <Button asChild href={href} variant="secondary" size="sm">
      {!iconAfter ? icon : null}
      {label}
      {iconAfter ? icon : null}
    </Button>
  );
}

function pageHref(basePath: string, searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") {
      params.set(key, value);
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
