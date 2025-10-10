'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Artwork } from '@/types/Artwork';
import BuyButton from '@/components/BuyButton';
import ImageGallery from '@/components/ImageGallery';

export default function ArtworkDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const locale = params.locale as string;

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/artwork/${slug}`);

        if (!response.ok) {
          throw new Error('Artwork not found');
        }

        const data = await response.json();
        setArtwork(data.artwork);
      } catch (err) {
        console.error('Error fetching artwork:', err);
        setError('Failed to load artwork details');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchArtwork();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <>
        <Navbar currentPath={`/artwork/${slug}`} />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (error || !artwork) {
    return (
      <>
        <Navbar currentPath={`/artwork/${slug}`} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="mb-8">{error || 'Artwork not found'}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar currentPath={`/artwork/${slug}`} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/shop" className="text-blue-600 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Artwork Images */}
          <div className="artwork-images">
            <div className="relative h-96 md:h-[500px] mb-4 rounded-lg overflow-hidden shadow-md">
              {artwork.images && artwork.images.length > 0 ? (
                // <Image
                //   src={artwork.images[selectedImage].url}
                //   alt={artwork.images[selectedImage].alt || artwork.title}
                //   fill
                //   style={{ objectFit: 'contain' }}
                //   className="bg-gray-100"
                // />
                <ImageGallery images={artwork.images} title={artwork.title} />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              {!artwork.inStock && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-md text-lg font-bold">
                  SOLD
                </div>
              )}
              {artwork.featured && (
                <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-bold">
                  FEATURED
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {artwork.images && artwork.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {artwork.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden ${selectedImage === index ? 'ring-2 ring-blue-500' : 'opacity-70'
                      }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `${artwork.title} - view ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Artwork Details */}
          <div className="artwork-details">
            <h1 className="text-3xl font-bold mb-2">{artwork.title}</h1>

            <div className="flex items-center mb-4">
              <p className="text-gray-600 mr-4">{artwork.medium}, {artwork.year}</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${artwork.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {artwork.inStock ? 'Available' : 'Sold'}
              </span>
            </div>

            <p className="text-2xl font-bold mb-6">${artwork.price}</p>

            <div className="prose max-w-none mb-8">
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="whitespace-pre-line">
                {artwork.description[locale] || artwork.description['en']}
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">Details</h3>
              <ul className="space-y-2">
                {artwork.dimensions && (
                  <li className="flex">
                    <span className="font-medium w-24">Dimensions:</span>
                    <span>{artwork.dimensions.width} × {artwork.dimensions.height} {artwork.dimensions.unit}</span>
                  </li>
                )}
                <li className="flex">
                  <span className="font-medium w-24">Medium:</span>
                  <span>{artwork.medium}</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-24">Year:</span>
                  <span>{artwork.year}</span>
                </li>
              </ul>
            </div>

            {artwork.inStock && (
              <div className="mt-8">
                <BuyButton artworkId={artwork.id} inStock={artwork.inStock} />
                <p className="text-sm text-gray-500 mt-2">
                  Secure checkout • Shipping available worldwide
                </p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Have Questions?</h3>
              <p className="mb-4">
                Contact the artist for inquiries about this artwork, commission requests, or shipping details.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition"
              >
                Contact the Artist
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
