"use client";

import Link from "next/link";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslations } from "next-intl";

interface NavbarProps {
  currentPath: string;
}

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
    <nav className="bg-cream shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Artist Name / Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-3xl font-bold text-bronze font-[family-name:var(--font-caveat)]"
            >
              Violetta Boyadzhieva
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link
                href="/about"
                className={
                  isActive("/about")
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }
              >
                {t("about")}
              </Link>
              <Link
                href="/gallery"
                className={
                  isActive("/gallery")
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }
              >
                {t("gallery")}
              </Link>
              <Link
                href="/shop"
                className={
                  isActive("/shop")
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }
              >
                {t("shop")}
              </Link>

              {/* Language Switcher - Desktop */}
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
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
                  strokeWidth={2}
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
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/about"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/about")
                ? "text-gray-900 bg-gray-100"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/gallery"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/gallery")
                ? "text-gray-900 bg-gray-100"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Gallery
          </Link>
          <Link
            href="/shop"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/shop")
                ? "text-gray-900 bg-gray-100"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Shop
          </Link>

          {/* For mobile, we'll use a simpler LanguageSwitcher */}
          <div className="px-3 py-2">
            <div className="flex space-x-4">
              <Link
                href={currentPath}
                locale="bg"
                className="px-3 py-1 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                BG
              </Link>
              <Link
                href={currentPath}
                locale="en"
                className="px-3 py-1 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                EN
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
