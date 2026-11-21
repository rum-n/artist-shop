"use client";

import Link from "next/link";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslations } from "next-intl";

interface NavbarProps {
  currentPath: string;
}

const LINKS = [
  { href: "/about", key: "about" },
  { href: "/gallery", key: "gallery" },
  { href: "/shop", key: "shop" },
  { href: "/contact", key: "contact" },
] as const;

export default function Navbar({ currentPath }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations("Navigation");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <nav className="bg-white border-b border-line">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Artist Name / Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="font-display text-title font-medium text-ink"
            >
              Violetta Boyadzhieva
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8 text-menu">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isActive(link.href)
                      ? "text-ink underline underline-offset-4"
                      : "text-ink/60 hover:text-ink transition-colors"
                  }
                >
                  {t(link.key)}
                </Link>
              ))}

              {/* Language Switcher - Desktop */}
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 text-ink focus:outline-none"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <svg
                className={`h-6 w-6 ${isMenuOpen ? "hidden" : "block"}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`h-6 w-6 ${isMenuOpen ? "block" : "hidden"}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-menu">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 ${
                isActive(link.href)
                  ? "text-ink underline underline-offset-4"
                  : "text-ink/60 hover:text-ink"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t(link.key)}
            </Link>
          ))}

          {/* Same switcher as desktop — the `locale` prop on next/link is a
              no-op in the App Router, so the old mobile links never switched. */}
          <div className="px-3 py-2">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
