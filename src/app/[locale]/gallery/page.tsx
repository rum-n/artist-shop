"use client";

import Image from "next/image";
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
  images?: Array<{
    url: string;
    alt?: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

function ArtworkCard({ artwork }: { artwork: ArtworkWithImages }) {
  return (
    <div className="artwork-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="relative h-80">
        {artwork.images && artwork.images[0] ? (
          <Image
            src={artwork.images[0].url}
            alt={artwork.title}
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>
    </div>
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

  return (
    <>
      <Navbar currentPath="/gallery" />
      <main className="container mx-auto px-4 py-8">
        <section className="gallery-header py-8">
          <h1 className="text-4xl mb-4 text-center">{t("title")}</h1>
          <p className="text-xl text-gray-600 mb-8 text-center">
            {t("description")}
          </p>
        </section>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No artworks to show yet.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {groupedSeries.map(({ series: s, items }) => (
              <section key={s.id} className="series-section">
                <div className="text-center mb-8">
                  <h2 className="text-3xl">{s.name}</h2>
                  {seriesDescription(s) && (
                    <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                      {seriesDescription(s)}
                    </p>
                  )}
                  <div className="w-16 h-px bg-primary-300 mx-auto mt-4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <div className="w-16 h-px bg-primary-300 mx-auto mt-4"></div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
