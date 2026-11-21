import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import { getHomeData } from "@/lib/homeData";
import { formatPrice } from "@/lib/price";
import { cloudinarySrcSet, optimizedImageUrl } from "@/lib/cloudinary";

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
          and no type laid over the artwork. The welcome text follows below it
          instead of competing with it.
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
          Dropped entirely when there is no welcome text — a lone "read more"
          under a section's worth of padding reads as a broken block. The nav
          still links to the about page.
        */}
        {homepageContent && (
          <section className="page-shell section">
            <div className="measure prose prose-lg">
              <ReactMarkdown>{homepageContent}</ReactMarkdown>
            </div>
            <Link
              href="/about"
              className="inline-block mt-8 text-menu text-ink/60 hover:text-ink transition-colors"
            >
              {t("readMore")}
            </Link>
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
                  {artwork.images[0] && (
                    // The image keeps its own proportions rather than being
                    // cropped to a fixed box.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={optimizedImageUrl(artwork.images[0].url)}
                      srcSet={cloudinarySrcSet(artwork.images[0].url, [400, 600, 800])}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      alt={artwork.images[0].alt || artwork.title}
                      width={artwork.images[0].width}
                      height={artwork.images[0].height}
                      loading="lazy"
                      className="w-full h-auto transition-opacity duration-300 group-hover:opacity-80"
                    />
                  )}
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
