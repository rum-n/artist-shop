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

      <main className="container mx-auto px-4 py-8">
        <section className="about-content max-w-4xl mx-auto py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="relative h-80 md:h-full rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/villy1.webp"
                  alt="Violetta Boyadzhieva"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
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
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bronze"></div>
                </div>
              ) : aboutContent ? (
                <div className="prose prose-lg max-w-none prose-headings:font-thin prose-headings:text-slate prose-p:text-slate/80 prose-a:text-bronze">
                  <ReactMarkdown>{aboutContent}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-slate/60">No about content available yet.</p>
              )}
            </div>
          </div>

          <div className="cta-section text-center py-8">
            <h2 className="text-2xl mb-6">Разгледайте произведенията</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/gallery"
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition"
              >
                Галерия
              </Link>
              <Link
                href="/shop"
                className="bg-slate text-white px-6 py-3 rounded-md hover:bg-slate/90 transition"
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
