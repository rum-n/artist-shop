'use client';

import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Artwork } from '@/types/Artwork';

export default function Home() {
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([]);
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured artworks
        const artworksResponse = await fetch('/api/artwork?featured=true&inStock=true');
        const artworksData = await artworksResponse.json();

        if (artworksData.artworks) {
          setFeaturedArtworks(artworksData.artworks.slice(0, 3));
        }

        // Fetch hero image from dedicated endpoint
        const heroResponse = await fetch('/api/settings/hero-image');
        const heroData = await heroResponse.json();

        if (heroData.imageUrl) {
          setHeroImage(heroData.imageUrl);
        } else {
          setHeroImage(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Navbar currentPath="/" />
      <main>
        {/* Hero Section with Fullscreen Image */}
        <section className="relative h-screen">
          {heroImage ? (
            <div className="absolute inset-0">
              <Image
                src={heroImage}
                alt="Hero Image"
                fill
                priority
                style={{ objectFit: 'cover' }}
              />
              {/* Overlay to ensure text is readable */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-white"></div>
          )}

          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
            <h1 className={`text-5xl font-bold mb-4 ${heroImage ? 'text-white' : 'text-gray-900'}`}>
              Art by Violetta Boyadzhieva
            </h1>
            <p className={`text-xl mb-8 ${heroImage ? 'text-gray-200' : 'text-gray-700'}`}>
              Discover unique artworks from a passionate creator
            </p>
            <Link
              href="/gallery"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
            >
              View Gallery
            </Link>
          </div>
        </section>

        {/* Featured Works Section */}
        <section className="featured-works py-16 container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArtworks && featuredArtworks.length > 0 && featuredArtworks.map((artwork: any) => (
              <div key={artwork.id} className="artwork-card border rounded-lg overflow-hidden">
                <div className="relative h-64">
                  {artwork.images && artwork.images[0] && (
                    <Image
                      src={artwork.images[0].url}
                      alt={artwork.images[0].alt || 'Artwork'}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold">{artwork.title}</h3>
                  <p className="text-gray-600">{artwork.medium}, {artwork.year}</p>
                  <p className="text-lg font-bold mt-2">${artwork.price}</p>
                  <Link
                    href={`/artwork/${artwork.slug}`}
                    className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/gallery"
              className="text-blue-600 hover:underline"
            >
              View All Artworks
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}