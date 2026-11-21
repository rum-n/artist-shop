'use client';

import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function About() {
  const [aboutContent, setAboutContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await fetch('/api/settings/about-me');
        const data = await response.json();
        setAboutContent(data.content || '');
      } catch (error) {
        console.error('Error fetching about content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutContent();
  }, []);

  return (
    <>
      <Navbar currentPath="/about" />

      <main className="page-shell section">
        <section className="about-content max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="relative h-80 md:h-full overflow-hidden">
                <Image
                  src="/villy1.webp"
                  alt="Violetta Boyadzhieva"
                  fill
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://via.placeholder.com/400x600?text=Artist+Portrait';
                  }}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t border-b border-ink"></div>
                </div>
              ) : aboutContent ? (
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown>{aboutContent}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-ink/60">No about content available yet.</p>
              )}
            </div>
          </div>

          <div className="cta-section text-center py-8">
            <h2 className="mb-6">Разгледайте произведенията</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/gallery"
                className="bg-ink text-white px-6 py-3 hover:opacity-80 transition-opacity"
              >
                Галерия
              </Link>
              <Link
                href="/shop"
                className="border border-ink text-ink px-6 py-3 hover:bg-ink hover:text-white transition-colors"
              >
                Онлайн магазин
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
