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
        {/* Hero Section with Fullscreen Image */}
        <section className="relative h-screen">
          {heroImage ? (
            <div className="absolute inset-0">
              {/*
                A Cloudinary srcset rather than next/image: the transform is
                done once at their CDN edge, so nothing has to pull the
                multi-megabyte original through our own optimizer first.
              */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={optimizedImageUrl(heroImage, 1920)}
                srcSet={cloudinarySrcSet(heroImage)}
                sizes="100vw"
                alt=""
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Overlay to ensure text is readable */}
              <div className="absolute inset-0 bg-black opacity-40"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-white"></div>
          )}

          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
            {homepageContent && (
              <div className={heroImage ? "text-white" : "text-ink"}>
                <ReactMarkdown>{homepageContent}</ReactMarkdown>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link
                href="/gallery"
                className={
                  heroImage
                    ? "bg-white text-ink px-6 py-3 hover:opacity-80 transition-opacity"
                    : "bg-ink text-white px-6 py-3 hover:opacity-80 transition-opacity"
                }
              >
                {t("buttons.gallery")}
              </Link>
              <Link
                href="/shop"
                className={
                  heroImage
                    ? "border border-white text-white px-6 py-3 hover:bg-white hover:text-ink transition-colors"
                    : "border border-ink text-ink px-6 py-3 hover:bg-ink hover:text-white transition-colors"
                }
              >
                {t("buttons.shop")}
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Works Section */}
        <section className="featured-works py-16 container mx-auto px-4">
          <h2 className="text-center">{t("firstSectionTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-start">
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
                    className="w-full h-auto transition-opacity group-hover:opacity-80"
                  />
                )}
                <div className="pt-4">
                  <h3 className="text-title mb-1">{artwork.title}</h3>
                  <p className="text-ink/60">
                    {artwork.medium}, {artwork.year}
                  </p>
                  <p className="mt-2">{formatPrice(artwork.price, locale)}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/gallery"
              className="inline-block border border-ink text-ink px-6 py-3 hover:bg-ink hover:text-white transition-colors"
            >
              {t("viewAll")}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
