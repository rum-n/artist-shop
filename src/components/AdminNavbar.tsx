'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

export default function AdminNavbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/admin" className="font-bold text-xl">
              Admin Dashboard
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin') && !isActive('/admin/artworks') && !isActive('/admin/series') && !isActive('/admin/orders') && !isActive('/admin/settings')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/artworks"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/artworks')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              Artworks
            </Link>
            <Link
              href="/admin/series"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/series')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              Series
            </Link>
            <Link
              href="/admin/orders"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/orders')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              Orders
            </Link>
            <Link
              href="/admin/settings"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/settings')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              Settings
            </Link>
            <div className="border-l border-gray-700 h-6 mx-2"></div>
            <Link
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              View Site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/admin"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin') && !isActive('/admin/artworks') && !isActive('/admin/series') && !isActive('/admin/orders') && !isActive('/admin/settings')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/artworks"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin/artworks')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
          >
            Artworks
          </Link>
          <Link
            href="/admin/series"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin/series')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
          >
            Series
          </Link>
          <Link
            href="/admin/orders"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin/orders')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
          >
            Orders
          </Link>
          <Link
            href="/admin/settings"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin/settings')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
          >
            Settings
          </Link>
          <div className="border-t border-gray-700 my-2"></div>
          <Link
            href="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            View Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}