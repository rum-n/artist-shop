"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";

/*
 * TODO: replace these with the artist's real details before going live.
 * Everything on this page is driven by these three values.
 */
const CONTACT = {
  email: "hello@example.com",
  instagram: "violetta.boyadzhieva",
  substack: "https://violettaboya.substack.com",
};

export default function Contact() {
  const t = useTranslations("ContactPage");

  return (
    <>
      <Navbar currentPath="/contact" />

      <main className="container mx-auto px-4 py-8">
        <section className="max-w-2xl mx-auto py-8">
          <h1>{t("title")}</h1>
          <p className="mb-12">{t("intro")}</p>

          <dl className="space-y-8">
            <div>
              <dt className="text-menu text-ink/60 mb-1">{t("emailLabel")}</dt>
              <dd>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="underline underline-offset-4 hover:opacity-60 transition-opacity"
                >
                  {CONTACT.email}
                </a>
              </dd>
            </div>

            <div>
              <dt className="text-menu text-ink/60 mb-1">
                {t("instagramLabel")}
              </dt>
              <dd>
                <a
                  href={`https://instagram.com/${CONTACT.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:opacity-60 transition-opacity"
                >
                  @{CONTACT.instagram}
                </a>
              </dd>
            </div>

            <div>
              <dt className="text-menu text-ink/60 mb-1">
                {t("newsletterLabel")}
              </dt>
              <dd>
                <a
                  href={CONTACT.substack}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:opacity-60 transition-opacity"
                >
                  {t("newsletterLink")}
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-16 pt-8 border-t border-line">
            <h2>{t("commissionTitle")}</h2>
            <p className="mb-6">{t("commissionText")}</p>
            <a
              href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(
                t("commissionSubject")
              )}`}
              className="inline-block bg-ink text-white px-6 py-3 hover:opacity-80 transition-opacity"
            >
              {t("commissionButton")}
            </a>
          </div>

          <div className="mt-12">
            <Link
              href="/gallery"
              className="text-menu text-ink/60 hover:text-ink transition-colors"
            >
              {t("backToGallery")}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
