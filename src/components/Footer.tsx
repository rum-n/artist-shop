"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const SUBSTACK_EMBED_URL = "https://violettaboya.substack.com/embed";

export default function Footer() {
  const pathname = usePathname();
  const t = useTranslations("Footer");

  // Keep the public newsletter footer off admin/login screens.
  if (pathname.includes("/admin") || pathname.includes("/login")) {
    return null;
  }

  return (
    <footer className="bg-white text-ink border-t border-line">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
          <h2>{t("newsletterTitle")}</h2>
          <p className="text-ink/60">{t("newsletterText")}</p>
          <iframe
            src={SUBSTACK_EMBED_URL}
            title={t("newsletterTitle")}
            width={480}
            height={320}
            className="mt-2 w-full max-w-[480px] border border-line bg-white"
          ></iframe>
        </div>

        <div className="mt-10 pt-6 border-t border-line text-center text-menu text-ink/60">
          © {new Date().getFullYear()} Violetta Boyadzhieva. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
