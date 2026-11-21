'use client';

import { useState } from 'react';
import { cloudinarySrcSet, optimizedImageUrl } from '@/lib/cloudinary';

interface GalleryImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  title: string;
}

// Only used while an image that has no stored dimensions is still loading.
const FALLBACK_RATIO = 4 / 5;

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Ratios measured in the browser, for artworks uploaded before Cloudinary's
  // dimensions were stored alongside the URL.
  const [measured, setMeasured] = useState<Record<number, number>>({});

  // Early return if no images
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/5] bg-primary-50 flex items-center justify-center">
        <p className="text-ink/50">No image available</p>
      </div>
    );
  }

  const current = images[currentIndex];
  const storedRatio =
    current.width && current.height ? current.width / current.height : null;
  const ratio = storedRatio ?? measured[currentIndex] ?? FALLBACK_RATIO;

  return (
    <div className="space-y-4">
      {/*
        The frame takes the artwork's own aspect ratio, so the image fills it
        exactly. A fixed ratio here would letterbox every non-matching painting
        and show bars down the sides.
      */}
      <div
        className="relative w-full mx-auto"
        style={{
          aspectRatio: ratio,
          // Caps the height of very tall portraits by limiting width instead,
          // so the frame still matches the image exactly and never letterboxes.
          maxWidth: `calc(85vh * ${ratio})`,
        }}
      >
        {/*
          Cloudinary does the resizing at its own edge, so the multi-megabyte
          original is never pulled through our optimizer.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={optimizedImageUrl(current.url, 1280)}
          srcSet={cloudinarySrcSet(current.url, [640, 960, 1280, 1920])}
          sizes="(max-width: 768px) 100vw, 50vw"
          alt={current.alt || title}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-contain"
          onLoad={(event) => {
            if (storedRatio) return;
            const { naturalWidth, naturalHeight } = event.currentTarget;
            if (!naturalWidth || !naturalHeight) return;
            setMeasured((prev) =>
              prev[currentIndex]
                ? prev
                : { ...prev, [currentIndex]: naturalWidth / naturalHeight }
            );
          }}
        />

        {/* Navigation arrows for larger screens */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-ink p-2 hidden md:block transition-colors"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-ink p-2 hidden md:block transition-colors"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
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
              className={`relative w-20 h-20 flex-shrink-0 overflow-hidden transition-opacity ${index === currentIndex ? 'ring-1 ring-ink' : 'opacity-60 hover:opacity-100'
                }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={optimizedImageUrl(image.url, 160)}
                alt={image.alt || `${title} - Image ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
