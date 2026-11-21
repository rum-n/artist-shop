"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";

const SUBSTACK_URL = "https://violettaboya.substack.com";

export default function Footer() {
  const pathname = usePathname();
  const t = useTranslations("Footer");

  // Keep the public newsletter footer off admin/login screens.
  if (pathname.includes("/admin") || pathname.includes("/login")) {
    return null;
  }

  return (
    <footer className="bg-white text-ink border-t border-line">
      <div className="page-shell section-tight">
        <div className="measure mx-auto text-center">
          <h2>{t("newsletterTitle")}</h2>
          <p className="text-ink/60">{t("newsletterText")}</p>

          {/*
            Replaces the Substack <iframe>, which rendered Substack's own
            styling — fixed at 480x320 inside a border — in the middle of the
            page. This posts to the same endpoint the embed uses, so the signup
            still works while the markup is ours.
          */}
          <form
            action={`${SUBSTACK_URL}/api/v1/free`}
            method="post"
            target="_blank"
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <input
              type="email"
              name="email"
              required
              aria-label={t("emailLabel")}
              placeholder={t("emailPlaceholder")}
              className="flex-1 max-w-xs border border-line px-4 py-3 focus:outline-none focus:border-ink transition-colors"
            />
            <button
              type="submit"
              className="bg-ink text-white px-8 py-3 hover:opacity-80 transition-opacity"
            >
              {t("subscribe")}
            </button>
          </form>

          <a
            href={SUBSTACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-menu text-ink/50 hover:text-ink transition-colors"
          >
            {t("substackLink")}
          </a>
        </div>

        <div className="mt-16 pt-8 border-t border-line flex flex-col sm:flex-row justify-between items-center gap-4 text-menu text-ink/60">
          <p>
            © {new Date().getFullYear()} Violetta Boyadzhieva. {t("rights")}
          </p>
          <Link href="/contact" className="hover:text-ink transition-colors">
            {t("contact")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
