"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const SUBSTACK_URL = "https://substack.com/@violettaboya";

export default function Footer() {
  const pathname = usePathname();
  const t = useTranslations("Footer");

  // Keep the public newsletter footer off admin/login screens.
  if (pathname.includes("/admin") || pathname.includes("/login")) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold">{t("newsletterTitle")}</h2>
          <p className="text-gray-300">{t("newsletterText")}</p>
          <a
            href={SUBSTACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium"
          >
            {t("newsletterButton")}
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Violetta Boyadzhieva. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
