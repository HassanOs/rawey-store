export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { AdminShell } from "@/components/organisms/admin-shell";
import { isAdminSession } from "@/lib/auth/admin-session";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isAdmin = await isAdminSession();

  if (!isAdmin) {
    redirect("/admin");
  }

  return <AdminShell>{children}</AdminShell>;
}
