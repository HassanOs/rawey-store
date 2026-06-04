import { Footer } from "@/components/organisms/footer";
import { Navbar } from "@/components/organisms/navbar";

export default function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-4 sm:pt-6">{children}</main>
      <Footer />
    </>
  );
}
