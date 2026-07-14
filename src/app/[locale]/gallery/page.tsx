"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useTranslations, useLocale } from "next-intl";
import { Series } from "@/types/Artwork";

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
  images?: Array<{
    url: string;
    alt?: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Let Cloudinary auto-format/compress and cap width for delivery, keeping the
// image's natural aspect ratio (only width is constrained).
function optimized(url: string) {
  return url.includes("/upload/")
    ? url.replace("/upload/", "/upload/f_auto,q_auto,w_800/")
    : url;
}

function ArtworkCard({ artwork }: { artwork: ArtworkWithImages }) {
  const dims = artwork.dimensions;
  const dimText =
    dims && dims.width && dims.height
      ? `${dims.width} × ${dims.height} ${dims.unit}`.trim()
      : "";

  return (
    <Link
      href={`/artwork/${artwork.slug}`}
      className="group block mb-10 break-inside-avoid"
    >
      {artwork.images && artwork.images[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={optimized(artwork.images[0].url)}
          alt={artwork.title}
          loading="lazy"
          className="w-full h-auto transition-opacity duration-300 group-hover:opacity-90"
        />
      ) : (
        <div className="w-full aspect-square bg-black/5 flex items-center justify-center">
          <span className="text-slate/40">No image available</span>
        </div>
      )}
      <div className="text-center mt-3">
        <p className="text-slate group-hover:text-bronze transition-colors">
          {artwork.title}
        </p>
        {dimText && <p className="text-sm text-slate/60 italic">{dimText}</p>}
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
      <main className="container mx-auto px-4 py-8">
        <section className="gallery-header py-8">
          <h1 className="text-4xl mb-4 text-center">{t("title")}</h1>
          <p className="text-xl text-slate/70 mb-8 text-center">
            {t("description")}
          </p>
        </section>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bronze"></div>
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-slate/70">No artworks to show yet.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {groupedSeries.map(({ series: s, items }) => (
              <section key={s.id} className="series-section">
                <div className="text-center mb-8">
                  <h2 className="text-3xl">{s.name}</h2>
                  {seriesDescription(s) && (
                    <p className="text-slate/70 mt-2 max-w-2xl mx-auto">
                      {seriesDescription(s)}
                    </p>
                  )}
                  <div className="w-16 h-px bg-sage mx-auto mt-4"></div>
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
                    <h2 className="text-3xl">{t("otherWorks")}</h2>
                    <div className="w-16 h-px bg-sage mx-auto mt-4"></div>
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
