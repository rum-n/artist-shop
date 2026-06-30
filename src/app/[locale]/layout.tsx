import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat, Roboto } from "next/font/google";
import "../globals.css";
import { Providers } from "../providers";
import Footer from "@/components/Footer";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["100", "300"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Violetta Boyadzhieva - Art Portfolio",
  description: "Discover unique artworks from a passionate creator",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${roboto.variable} antialiased`}>
        <NextIntlClientProvider>
          <Providers>
            {children}
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}