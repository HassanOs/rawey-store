import { redirect } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { isAdminSession } from "@/lib/auth/admin-session";
import { loginAdmin } from "./actions";

type AdminPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [{ error }, isAdmin] = await Promise.all([searchParams, isAdminSession()]);

  if (isAdmin) {
    redirect("/admin/overview");
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <form action={loginAdmin} className="w-full rounded-2xl border border-rawey-line bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">دخول الإدارة</h1>
        <p className="mt-2 text-sm text-rawey-muted">أدخل كلمة مرور الإدارة.</p>
        <Input name="password" type="password" placeholder="كلمة المرور" className="mt-6" required />
        {error ? (
          <p className="mt-3 text-sm text-red-600">
            {error === "rate" ? "محاولات كثيرة. حاول مرة أخرى لاحقاً." : "كلمة المرور غير صحيحة."}
          </p>
        ) : null}
        <Button type="submit" className="mt-5 w-full">
          دخول
        </Button>
      </form>
    </section>
  );
}
