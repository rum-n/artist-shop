"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useTranslations, useLocale } from "next-intl";
import { ArtworkImage, Series } from "@/types/Artwork";
import { cloudinarySrcSet, optimizedImageUrl } from "@/lib/cloudinary";

interface ArtworkWithImages {
  id: string;
  title: string;
  slug: string;
  price: number;
  medium: string;
  year: number;
  inStock: boolean;
  featured: boolean;
  seriesId?: string | null;
  dimensions?: {
    width: string;
    height: string;
    unit: string;
  };
  images?: ArtworkImage[];
  createdAt?: Date;
  updatedAt?: Date;
}

function ArtworkCard({ artwork }: { artwork: ArtworkWithImages }) {
  const dims = artwork.dimensions;
  const dimText =
    dims && dims.width && dims.height
      ? `${dims.width} × ${dims.height} ${dims.unit}`.trim()
      : "";

  const images = artwork.images ?? [];
  const [primary, secondary] = images;

  return (
    <Link
      href={`/artwork/${artwork.slug}`}
      className="group block mb-10 break-inside-avoid"
    >
      {primary ? (
        /*
         * The first image sets the card's height (the masonry columns rely on
         * the natural ratio), and the second is laid over it and faded in on
         * hover. Artworks with a single image simply don't change.
         */
        <div className="relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={optimizedImageUrl(primary.url)}
            srcSet={cloudinarySrcSet(primary.url, [400, 600, 800, 1200])}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt={artwork.title}
            width={primary.width}
            height={primary.height}
            loading="lazy"
            decoding="async"
            className="w-full h-auto"
          />
          {secondary && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={optimizedImageUrl(secondary.url)}
              srcSet={cloudinarySrcSet(secondary.url, [400, 600, 800, 1200])}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </div>
      ) : (
        <div className="w-full aspect-square bg-primary-50 flex items-center justify-center">
          <span className="text-ink/40">No image available</span>
        </div>
      )}
      <div className="text-center mt-3">
        <p className="text-ink transition-opacity group-hover:opacity-60">
          {artwork.title}
        </p>
        {dimText && <p className="text-menu text-ink/60">{dimText}</p>}
      </div>
    </Link>
  );
}

export default function Gallery() {
  const [artworks, setArtworks] = useState<ArtworkWithImages[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("GalleryPage");
  const locale = useLocale();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [artworksRes, seriesRes] = await Promise.all([
          fetch("/api/artwork"),
          fetch("/api/series"),
        ]);
        const artworksData = await artworksRes.json();
        const seriesData = await seriesRes.json();

        setArtworks(artworksData.artworks || []);
        setSeries(seriesData.series || []);
      } catch (error) {
        console.error("Error fetching gallery data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group artworks by series, in the order series are configured. Artworks not
  // assigned to any (existing) series fall into a trailing "Other works" group.
  const groupedSeries = series
    .map((s) => ({
      series: s,
      items: artworks.filter((a) => a.seriesId === s.id),
    }))
    .filter((group) => group.items.length > 0);

  const assignedIds = new Set(
    groupedSeries.flatMap((g) => g.items.map((a) => a.id))
  );
  const ungrouped = artworks.filter((a) => !assignedIds.has(a.id));

  const seriesDescription = (s: Series) =>
    s.description?.[locale] || s.description?.en || "";

  const masonry = "columns-1 sm:columns-2 lg:columns-3 gap-10";

  return (
    <>
      <Navbar currentPath="/gallery" />
      <main className="page-shell section">
        <section className="mb-16">
          <h1 className="text-center">{t("title")}</h1>
          <p className="text-ink/60 mb-8 text-center">
            {t("description")}
          </p>
        </section>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t border-b border-ink"></div>
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink/60">No artworks to show yet.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {groupedSeries.map(({ series: s, items }) => (
              <section key={s.id} className="series-section">
                <div className="text-center mb-8">
                  <h2>{s.name}</h2>
                  {seriesDescription(s) && (
                    <p className="text-ink/60 mt-2 max-w-2xl mx-auto">
                      {seriesDescription(s)}
                    </p>
                  )}
                  <div className="w-16 h-px bg-line mx-auto mt-4"></div>
                </div>
                <div className={masonry}>
                  {items.map((artwork) => (
                    <ArtworkCard key={artwork.id} artwork={artwork} />
                  ))}
                </div>
              </section>
            ))}

            {ungrouped.length > 0 && (
              <section className="series-section">
                {groupedSeries.length > 0 && (
                  <div className="text-center mb-8">
                    <h2>{t("otherWorks")}</h2>
                    <div className="w-16 h-px bg-line mx-auto mt-4"></div>
                  </div>
                )}
                <div className={masonry}>
                  {ungrouped.map((artwork) => (
                    <ArtworkCard key={artwork.id} artwork={artwork} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </>
  );
}
