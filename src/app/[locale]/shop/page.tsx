"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Artwork } from "@/types/Artwork";
import BuyButton from "@/components/BuyButton";
import { useTranslations, useLocale } from "next-intl";
import { formatPrice } from "@/lib/price";
import { cloudinarySrcSet, optimizedImageUrl } from "@/lib/cloudinary";

export default function Shop() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const t = useTranslations("ShopPage");
  const locale = useLocale();

  useEffect(() => {
    const fetchArtworks = async () => {
      setIsLoading(true);
      try {
        // Fetch only available artworks (inStock=true)
        const response = await fetch(
          `${window.location.origin}/api/artwork?inStock=true`
        );
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

  // Sort artworks based on selected option
  const sortedArtworks = [...artworks].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "newest":
        return (
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt || "").getTime() -
          new Date(b.createdAt || "").getTime()
        );
      default:
        return 0;
    }
  });

  const filteredArtworks = sortedArtworks.filter(
    (artwork) =>
      artwork.price >= priceRange[0] && artwork.price <= priceRange[1]
  );

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange([min, max]);
  };

  return (
    <>
      <Navbar currentPath="/shop" />

      <main className="container mx-auto px-4 py-8">
        <section className="shop-filters mb-8">
          <div className="p-6 border border-line">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label
                      htmlFor="sort"
                      className="block text-menu text-ink/60 mb-1"
                    >
                      {t("sort")}
                    </label>
                    <select
                      id="sort"
                      value={sortOption}
                      onChange={handleSortChange}
                      className="block w-full border border-line text-menu h-8 px-2"
                    >
                      <option value="newest">{t("newest")}</option>
                      <option value="oldest">{t("oldest")}</option>
                      <option value="price-low">{t("price-asc")}</option>
                      <option value="price-high">{t("price-desc")}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <p className="text-menu text-ink/60 mb-1">
                  {t("price")}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePriceRangeChange(0, 10000)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      priceRange[0] === 0 && priceRange[1] === 10000
                        ? "bg-ink text-white"
                        : "bg-white text-ink/70 border border-line hover:border-ink"
                    }`}
                  >
                    {t("all")}
                  </button>
                  <button
                    onClick={() => handlePriceRangeChange(0, 500)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      priceRange[0] === 0 && priceRange[1] === 500
                        ? "bg-ink text-white"
                        : "bg-white text-ink/70 border border-line hover:border-ink"
                    }`}
                  >
                    {t("under500")}
                  </button>
                  <button
                    onClick={() => handlePriceRangeChange(500, 1000)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      priceRange[0] === 500 && priceRange[1] === 1000
                        ? "bg-ink text-white"
                        : "bg-white text-ink/70 border border-line hover:border-ink"
                    }`}
                  >
                    {t("500to1000")}
                  </button>
                  <button
                    onClick={() => handlePriceRangeChange(1000, 10000)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      priceRange[0] === 1000 && priceRange[1] === 10000
                        ? "bg-ink text-white"
                        : "bg-white text-ink/70 border border-line hover:border-ink"
                    }`}
                  >
                    {t("over1000")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t border-b border-ink"></div>
          </div>
        ) : (
          <section className="artwork-grid">
            {filteredArtworks.length > 0 ? (
              <>
                <p className="text-menu text-ink/60 mb-4">
                  {filteredArtworks.length} {t("nrOfArtworks")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-start">
                  {filteredArtworks.map((artwork) => (
                    <div key={artwork.id} className="artwork-card group">
                      <Link href={`/artwork/${artwork.slug}`} className="block">
                        {artwork.images && artwork.images[0] ? (
                          // Natural proportions — the artwork is never cropped
                          // to fit a fixed card height.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={optimizedImageUrl(artwork.images[0].url)}
                            srcSet={cloudinarySrcSet(artwork.images[0].url, [400, 600, 800, 1200])}
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            alt={artwork.images[0].alt || artwork.title}
                            width={artwork.images[0].width}
                            height={artwork.images[0].height}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-auto transition-opacity group-hover:opacity-80"
                          />
                        ) : (
                          <div className="w-full aspect-[4/5] bg-primary-50 flex items-center justify-center">
                            <span className="text-ink/40">{t("noImage")}</span>
                          </div>
                        )}
                      </Link>
                      <div className="pt-4">
                        <h3 className="text-title mb-1">{artwork.title}</h3>
                        <p className="text-ink/60">
                          {artwork.medium}, {artwork.year}
                        </p>
                        <p className="mt-2">
                          {formatPrice(artwork.price, locale)}
                        </p>
                        <div className="mt-4 flex flex-col sm:flex-row gap-2 w-full">
                          <Link
                            href={`/artwork/${artwork.slug}`}
                            className="text-center border border-ink text-ink px-4 py-2 hover:bg-ink hover:text-white transition-colors flex justify-center items-center"
                          >
                            {t("seeMore")}
                          </Link>
                          <BuyButton
                            artworkId={artwork.id}
                            inStock={artwork.inStock}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-ink/60">{t("noArtworks")}</p>
                <button
                  onClick={() => {
                    setSortOption("newest");
                    setPriceRange([0, 10000]);
                  }}
                  className="mt-4 border border-ink text-ink px-4 py-2 hover:bg-ink hover:text-white transition-colors"
                >
                  {t("removeFilters")}
                </button>
              </div>
            )}
          </section>
        )}

        <section className="commission-cta mt-16 p-8 border-t border-line text-center">
          <h2>{t("ctaTitle")}</h2>
          <p className="mb-6 max-w-2xl mx-auto">{t("ctaText")}</p>
          <Link
            href="/contact"
            className="inline-block bg-ink text-white px-6 py-3 hover:opacity-80 transition-opacity"
          >
            {t("ctaButton")}
          </Link>
        </section>
      </main>
    </>
  );
}
