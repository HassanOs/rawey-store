import { Instagram, MapPin, MessageCircle } from "lucide-react";

function getWhatsappHref() {
  const shopPhone = (process.env.SHOP_WHATSAPP_PHONE || process.env.WISH_MONEY_PHONE || "").replace(/[^\d]/g, "");

  return shopPhone ? `https://wa.me/${shopPhone}` : "https://wa.me/";
}

export function Footer() {
  return (
    <footer className="border-t border-rawey-line bg-white/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-center text-sm text-rawey-muted sm:px-6 md:grid-cols-3 md:text-right lg:px-8">
        <section>
          <h2 className="text-sm font-bold text-rawey-text">من نحن</h2>
          <p className="mt-2 leading-7">
            متجر مختص في بيع التقاسيم والعطور البراندات الاصلية. (Decants). توصيل لكل لبنان.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-rawey-text">معلومات</h2>
          <p className="mt-2 inline-flex items-center justify-center gap-2 md:justify-start">
            <MapPin className="h-4 w-4 text-rawey-gold" />
            لبنان - الضنية
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-rawey-text">وسائل التواصل</h2>
          <div className="mt-3 flex items-center justify-center gap-2 md:justify-start">
            <a
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rawey-line text-rawey-text transition hover:border-rawey-gold hover:text-rawey-gold"
              href="https://www.instagram.com/rawey.perfume"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram rawey.perfume"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rawey-line text-rawey-text transition hover:border-rawey-gold hover:text-rawey-gold"
              href={getWhatsappHref()}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </section>
      </div>
    </footer>
  );
}
