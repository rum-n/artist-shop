"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useTranslations } from "next-intl";

interface ArtworkWithImages {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  medium: string;
  year: number;
  inStock: boolean;
  featured: boolean;
  images?: Array<{
    url: string;
    alt?: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function Gallery() {
  const [artworks, setArtworks] = useState<ArtworkWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const t = useTranslations("GalleryPage");

  useEffect(() => {
    const fetchArtworks = async () => {
      setIsLoading(true);
      try {
        // Fetch all artworks from API endpoint (no filters)
        const response = await fetch(`${window.location.origin}/api/artwork`);
        const data = await response.json();

        if (data.artworks) {
          setArtworks(data.artworks);
        }
      } catch (error) {
        console.error("Error fetching artworks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  const filteredArtworks = artworks.filter((artwork) => {
    if (filter === "all") return true;
    if (filter === "available") return artwork.inStock;
    if (filter === "sold") return !artwork.inStock;
    return true;
  });

  return (
    <>
      <Navbar currentPath="/gallery" />
      <main className="container mx-auto px-4 py-8">
        <section className="gallery-header py-8">
          <h1 className="text-4xl font-bold mb-4 text-center">{t("title")}</h1>
          <p className="text-xl text-gray-600 mb-8 text-center">
            {t("description")}
          </p>

          {/* Filter Controls */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                } border border-gray-200`}
              >
                {t("filters.all")}
              </button>
              <button
                type="button"
                onClick={() => setFilter("available")}
                className={`px-4 py-2 text-sm font-medium ${
                  filter === "available"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                } border-t border-b border-r border-gray-200`}
              >
                {t("filters.available")}
              </button>
              <button
                type="button"
                onClick={() => setFilter("sold")}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  filter === "sold"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                } border-t border-b border-r border-gray-200`}
              >
                {t("filters.sold")}
              </button>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <section className="artwork-grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArtworks.map((artwork) => (
                <div
                  key={artwork.id}
                  className="artwork-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
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
                        <span className="text-gray-400">
                          No image available
                        </span>
                      </div>
                    )}
                    {artwork.inStock === false && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                        SOLD
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredArtworks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">
                  No artworks found matching your criteria.
                </p>
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}
