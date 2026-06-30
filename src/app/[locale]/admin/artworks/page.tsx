'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import AdminNavbar from '@/components/AdminNavbar';
import EditArtworkModal from '@/components/EditArtworkModal';
import { Artwork } from '@/types/Artwork';

export default function ManageArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editArtworkId, setEditArtworkId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchArtworks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/artwork');
      if (!response.ok) throw new Error('Failed to fetch artworks');

      const data = await response.json();
      setArtworks(data.artworks);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast.error('Failed to load artworks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchArtworks();
    }
  }, [status]);

  const handleDeleteArtwork = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/artwork/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete artwork');
      }

      toast.success('Artwork deleted successfully');
      fetchArtworks();
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast.error((error as Error).message || 'Failed to delete artwork');
    } finally {
      setIsDeleting(null);
    }
  };

  if (status === 'loading') {
    return (
      <>
        <AdminNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Artworks</h1>
          <Link
            href="/admin/artworks/new"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add New Artwork
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artwork
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {artworks.map((artwork) => {
                  const firstImage = Array.isArray(artwork.images) && artwork.images.length > 0
                    ? typeof artwork.images[0] === 'object' && artwork.images[0] !== null && 'url' in artwork.images[0]
                      ? artwork.images[0]
                      : null
                    : null;

                  return (
                    <tr key={artwork.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16 relative">
                            {firstImage ? (
                              <Image
                                src={firstImage.url}
                                alt={artwork.title}
                                fill
                                className="object-cover rounded"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{artwork.title}</div>
                            <div className="text-sm text-gray-500">{artwork.medium}, {artwork.year}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">€{artwork.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${artwork.inStock
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {artwork.inStock ? 'Available' : 'Sold'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${artwork.featured
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {artwork.featured ? 'Featured' : 'Not Featured'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setEditArtworkId(artwork.id)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteArtwork(artwork.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={isDeleting === artwork.id}
                        >
                          {isDeleting === artwork.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {artworks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No artworks found. Add a new artwork to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Artwork Modal */}
      {editArtworkId && (
        <EditArtworkModal
          artworkId={editArtworkId}
          onClose={() => setEditArtworkId(null)}
          onSave={() => {
            setEditArtworkId(null);
            fetchArtworks();
          }}
        />
      )}
    </>
  );
}