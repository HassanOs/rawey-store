import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { getProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/molecules/product-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.slice(0, 4);

  return (
    <>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8">
        <div>
          <Badge className="mb-5">Original perfume testers</Badge>
          <h1 className="max-w-3xl pb-3 text-4xl font-extrabold leading-[1.65] text-rawey-text sm:text-6xl">
            أرقى العطور العالمية، الآن بين يديك
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-rawey-muted">
            اختر العينة التي تناسب ذوقك
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild href="/products" size="lg">
              تسوق الآن
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button asChild href="/cart" size="lg" variant="secondary">
              السلة
            </Button>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-rawey-line bg-white shadow-soft">
          <Image
            src="https://images.unsplash.com/photo-1595425964071-2c1ec7c5d59d?q=80&w=1400&auto=format&fit=crop"
            alt="Perfume testers"
            fill
            priority
            sizes="(min-width: 1024px) 520px, 100vw"
            className="object-cover"
          />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Sparkles className="mb-2 h-5 w-5 text-rawey-gold" />
            <h2 className="text-2xl font-semibold">وصل حديثاً</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-rawey-muted hover:text-rawey-text">
            عرض الكل
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
