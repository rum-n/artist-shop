'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: { url: string; alt?: string }[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Early return if no images
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 flex items-center justify-center rounded-md">
        <p className="text-gray-500">No image available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
        <Image
          src={images[currentIndex].url}
          alt={images[currentIndex].alt || title}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {/* Navigation arrows for larger screens */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 text-gray-800 shadow-md hidden md:block"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 text-gray-800 shadow-md hidden md:block"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden ${index === currentIndex ? 'ring-2 ring-primary-500' : 'opacity-70'
                }`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${title} - Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}