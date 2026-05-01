import { Button } from "@/components/atoms/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-rawey-gold">404</p>
      <h1 className="mt-3 text-3xl font-semibold text-rawey-text">الصفحة غير موجودة</h1>
      <p className="mt-3 max-w-xl text-rawey-muted">الرابط غير صحيح أو أن المنتج لم يعد متوفراً.</p>
      <Button asChild href="/products" className="mt-8">
        العودة للمنتجات
      </Button>
    </section>
  );
}
