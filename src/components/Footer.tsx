"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SITE, SOCIAL_LINKS } from "@/lib/site";
import { InstagramPost } from "@/lib/instagram";
import { optimizedImageUrl } from "@/lib/cloudinary";

export default function Footer({
  instagramPosts = [],
}: {
  instagramPosts?: InstagramPost[];
}) {
  const pathname = usePathname();
  const t = useTranslations("Footer");

  // Keep the public newsletter footer off admin/login screens.
  if (pathname.includes("/admin") || pathname.includes("/login")) {
    return null;
  }

  return (
    <footer className="bg-white text-ink border-t border-line">
      {/*
        Strip of photos linking out to her posts, managed from admin settings.
        Renders nothing until she adds some, so an empty list never leaves a gap.
      */}
      {instagramPosts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {instagramPosts.map((post) => (
            <a
              key={post.url}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block aspect-square overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={optimizedImageUrl(post.image, 600)}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
              />
            </a>
          ))}
        </div>
      )}

      <div className="page-shell section-tight">
        <div className="measure mx-auto text-center">
          <h2>{t("newsletterTitle")}</h2>
          <p className="text-ink/60">{t("newsletterText")}</p>

          {/*
            Replaces the Substack <iframe>, which rendered Substack's own
            styling inside the page. This posts to the same endpoint the embed
            uses, so the signup still works while the markup is ours.
          */}
          <form
            action={`${SITE.substack}/api/v1/free`}
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
        </div>

        <div className="mt-16 pt-8 border-t border-line flex flex-col sm:flex-row justify-between items-center gap-6 text-menu text-ink/60">
          <p>
            © {new Date().getFullYear()} Violetta Boyadzhieva. {t("rights")}
          </p>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.url}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors"
              >
                {social.label}
              </a>
            ))}
            <Link href="/contact" className="hover:text-ink transition-colors">
              {t("contact")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
