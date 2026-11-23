import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import ArtworkThumb from "@/components/ArtworkThumb";
import { getHomeData } from "@/lib/homeData";
import { formatPrice } from "@/lib/price";
import { cloudinarySrcSet, optimizedImageUrl } from "@/lib/cloudinary";
import { SITE } from "@/lib/site";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  // Fetched on the server, so the hero's URL is in the HTML the browser first
  // receives and its download starts immediately.
  const { heroImage, homepageContent, featuredArtworks } = await getHomeData();

  return (
    <>
      <Navbar currentPath="/" />
      <main>
        {/*
          A plain full-bleed image, the way the reference site opens: no scrim
          and no type laid over the artwork.
        */}
        {heroImage && (
          <section>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={optimizedImageUrl(heroImage, 1920)}
              srcSet={cloudinarySrcSet(heroImage)}
              sizes="100vw"
              alt=""
              fetchPriority="high"
              decoding="async"
              className="w-full h-[70vh] md:h-[80vh] object-cover"
            />
          </section>
        )}

        {/*
          Welcome band: her portrait alongside whatever she writes in the
          homepage content field. Dropped entirely when that text is empty,
          rather than leaving a photo with nothing beside it.
        */}
        {homepageContent && (
          <section className="page-shell section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SITE.portrait}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-auto"
              />
              <div>
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown>{homepageContent}</ReactMarkdown>
                </div>
                <Link
                  href="/about"
                  className="inline-block mt-8 text-menu text-ink/60 hover:text-ink transition-colors"
                >
                  {t("readMore")}
                </Link>
              </div>
            </div>
          </section>
        )}

        {featuredArtworks.length > 0 && (
          <section className="featured-works page-shell section">
            <h2 className="mb-12">{t("firstSectionTitle")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16 items-start">
              {featuredArtworks.map((artwork) => (
                <Link
                  key={artwork.id}
                  href={`/artwork/${artwork.slug}`}
                  className="artwork-card group block"
                >
                  <ArtworkThumb
                    images={artwork.images}
                    title={artwork.title}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    widths={[400, 600, 800]}
                  />
                  <div className="pt-4">
                    <h3 className="mb-1">{artwork.title}</h3>
                    <p className="text-ink/60">
                      {artwork.medium}, {artwork.year}
                    </p>
                    <p className="mt-2">{formatPrice(artwork.price, locale)}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-16 text-center">
              <Link
                href="/gallery"
                className="inline-block border border-ink text-ink px-8 py-3 hover:bg-ink hover:text-white transition-colors"
              >
                {t("viewAll")}
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
