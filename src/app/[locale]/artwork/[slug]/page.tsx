'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import Navbar from '@/components/Navbar';
import { Artwork } from '@/types/Artwork';
import BuyButton from '@/components/BuyButton';
import ImageGallery from '@/components/ImageGallery';
import { formatPrice } from '@/lib/price';
import { useShopStatus } from '@/lib/useShopStatus';
import ShopClosedNotice from '@/components/ShopClosedNotice';

export default function ArtworkDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const locale = useLocale();
  const t = useTranslations('ArtworkPage');
  const { status: shopStatus, loaded: statusLoaded } = useShopStatus();

  const [artwork, setArtwork] = useState<Artwork | null>(null);
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
        setError(t('loadFailed'));
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchArtwork();
    }
  }, [slug, t]);

  if (isLoading) {
    return (
      <>
        <Navbar currentPath={`/artwork/${slug}`} />
        <div className="page-shell section flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t border-b border-ink"></div>
        </div>
      </>
    );
  }

  if (error || !artwork) {
    return (
      <>
        <Navbar currentPath={`/artwork/${slug}`} />
        <div className="page-shell section text-center">
          <h2>{t('notFound')}</h2>
          <p className="mb-8">{error}</p>
          <Link href="/gallery" className="underline underline-offset-4">
            {t('buttons.back')}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar currentPath={`/artwork/${slug}`} />
      <main className="page-shell section">
        <div className="mb-8">
          <Link href="/gallery" className="inline-flex items-center text-menu text-ink/60 hover:text-ink transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {t('buttons.back')}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/*
            Artwork images. The gallery sizes itself to each image's own aspect
            ratio, so nothing here may constrain its height.
          */}
          <div className="artwork-images relative">
            <ImageGallery images={artwork.images || []} title={artwork.title} />

            {!artwork.inStock && (
              <div className="absolute top-4 right-4 bg-ink text-white px-3 py-1 text-menu tracking-wide">
                {t('sold')}
              </div>
            )}
          </div>

          {/* Artwork Details */}
          <div className="artwork-details">
            <h1 className="text-subhead mb-2">{artwork.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              <p className="text-ink/60">{artwork.medium}, {artwork.year}</p>
              <span className="text-menu text-ink/60">
                {artwork.inStock ? t('available') : t('sold')}
              </span>
            </div>

            <p className="text-2xl mb-8">{formatPrice(artwork.price, locale)}</p>

            <div className="prose max-w-none mb-8">
              <h3>{t('description')}</h3>
              <p className="whitespace-pre-line">
                {artwork.description[locale] || artwork.description['en']}
              </p>
            </div>

            <div className="mb-8">
              <h3>{t('details')}</h3>
              <ul className="space-y-2">
                {artwork.dimensions && (
                  <li className="flex">
                    <span className="w-32 text-ink/60">{t('dimensions')}</span>
                    <span>{artwork.dimensions.width} × {artwork.dimensions.height} {artwork.dimensions.unit}</span>
                  </li>
                )}
                <li className="flex">
                  <span className="w-32 text-ink/60">{t('medium')}</span>
                  <span>{artwork.medium}</span>
                </li>
                <li className="flex">
                  <span className="w-32 text-ink/60">{t('year')}</span>
                  <span>{artwork.year}</span>
                </li>
              </ul>
            </div>

            {artwork.inStock && statusLoaded && (
              <div className="mt-8">
                {shopStatus.closed ? (
                  <ShopClosedNotice status={shopStatus} />
                ) : (
                  <>
                    <BuyButton artworkId={artwork.id} inStock={artwork.inStock} />
                    <p className="text-menu text-ink/60 mt-2">{t('checkoutNote')}</p>
                  </>
                )}
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-line">
              <h3>{t('questionsTitle')}</h3>
              <p className="mb-4">{t('questionsText')}</p>
              <Link
                href="/contact"
                className="inline-block border border-ink text-ink px-5 py-2 hover:bg-ink hover:text-white transition-colors"
              >
                {t('contactButton')}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
