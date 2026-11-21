"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const LANGUAGE_STORAGE_KEY = "userLanguagePreference";

export default function LanguageSwitcher() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState("en");
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: "en", name: "EN" },
    { code: "bg", name: "BG" },
  ];

  // Initialize locale from localStorage or browser settings
  useEffect(() => {
    if (typeof window === "undefined") return;

    // First check localStorage for saved preference
    const savedLocale = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (savedLocale && languages.some((lang) => lang.code === savedLocale)) {
      setCurrentLocale(savedLocale);
      const newPath = pathname.replace(/^\/[^\/]+/, `/${savedLocale}`);
      router.push(newPath);
      return;
    }

    // Fall back to browser locale detection if no saved preference
    const detectBrowserLocale = () => {
      if (navigator) {
        // Get browser language (e.g., 'en-US', 'bg', etc.)
        const browserLang = navigator.language;

        // Extract the base language code (e.g., 'en' from 'en-US')
        const baseLang = browserLang.split("-")[0].toLowerCase();

        // Check if we support this language
        const isSupported = languages.some((lang) => lang.code === baseLang);

        // Set the locale (use browser's if supported, otherwise default to 'en')
        const detectedLocale = isSupported ? baseLang : "en";
        setCurrentLocale(detectedLocale);

        // Also store this initial detected preference
        localStorage.setItem(LANGUAGE_STORAGE_KEY, detectedLocale);

        const newPath = pathname.replace(/^\/[^\/]+/, `/${detectedLocale}`);
        router.push(newPath);
      }
    };

    detectBrowserLocale();
  }, [router, pathname]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLocaleChange = (locale: string) => {
    // Update state
    setCurrentLocale(locale);
    setIsDropdownOpen(false);

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    }

    // Change locale by updating the path
    const newPath = pathname.replace(/^\/[^\/]+/, `/${locale}`);
    router.push(newPath);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-ink/60 hover:text-ink transition-colors focus:outline-none cursor-pointer"
      >
        <span>{currentLocale.toUpperCase()}</span>
        <svg
          className="ml-1 w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-20 bg-white border border-line shadow-sm z-100">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLocaleChange(lang.code)}
                className={`block px-4 py-2 text-sm cursor-pointer ${
                  currentLocale === lang.code
                    ? "text-ink bg-primary-50"
                    : "text-ink/60 hover:bg-primary-50"
                } w-full text-left cursor-pointer`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
