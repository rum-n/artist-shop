'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminNavbar from '@/components/AdminNavbar';
import dynamic from 'next/dynamic';

// Import the client-only MDXEditor component with dynamic import and no SSR
const ClientMDXEditor = dynamic(() => import('@/components/ClientMDXEditor'), {
  ssr: false,
});

export default function SiteSettings() {
  const { status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
  }

  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [currentHeroImage, setCurrentHeroImage] = useState<string | null>(null);
  const [aboutMeContent, setAboutMeContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editorLoaded, setEditorLoaded] = useState(false);

  useEffect(() => {
    // Fetch current hero image
    const fetchHeroImage = async () => {
      try {
        const response = await fetch('/api/settings/hero-image');
        const data = await response.json();
        setCurrentHeroImage(data.imageUrl);
      } catch (error) {
        console.error('Error fetching hero image:', error);
      }
    };

    // Fetch current about me content
    const fetchAboutMeContent = async () => {
      try {
        const response = await fetch('/api/settings/about-me');
        const data = await response.json();
        setAboutMeContent(data.content || '');
        setEditorLoaded(true);
      } catch (error) {
        console.error('Error fetching about me content:', error);
        setEditorLoaded(true);
      }
    };

    fetchHeroImage();
    fetchAboutMeContent();
  }, []);

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroImage(e.target.files[0]);
    }
  };

  const handleHeroImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroImage) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('heroImage', heroImage);

      const response = await fetch('/api/settings/hero-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update hero image');
      }

      const data = await response.json();
      setCurrentHeroImage(data.imageUrl);
      setSuccessMessage('Hero image updated successfully');
    } catch (error) {
      setError('An error occurred while updating the hero image');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAboutMeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/settings/about-me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: aboutMeContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to update about me content');
      }

      setSuccessMessage('About me content updated successfully');
    } catch (error) {
      setError('An error occurred while updating the about me content');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Site Settings</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4">Hero Image</h2>

          {currentHeroImage && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current Hero Image:</p>
              <img
                src={currentHeroImage}
                alt="Current hero image"
                className="w-full max-w-md h-auto rounded-md"
              />
            </div>
          )}

          <form onSubmit={handleHeroImageSubmit}>
            <div className="mb-4">
              <label htmlFor="heroImage" className="block text-gray-700 mb-2">
                Upload New Hero Image
              </label>
              <input
                type="file"
                id="heroImage"
                accept="image/*"
                onChange={handleHeroImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="submit"
              disabled={!heroImage || isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Uploading...' : 'Update Hero Image'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">About Me Content</h2>

          <form onSubmit={handleAboutMeSubmit}>
            <div className="mb-4">
              <label htmlFor="aboutMeContent" className="block text-gray-700 mb-2">
                About Me Content
              </label>
              <div className="border border-gray-300 rounded-md overflow-hidden">
                {editorLoaded ? (
                  <ClientMDXEditor
                    markdown={aboutMeContent}
                    onChange={setAboutMeContent}
                  />
                ) : (
                  <div className="flex justify-center items-center h-[400px] bg-gray-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 mt-4"
            >
              {isSubmitting ? 'Saving...' : 'Update About Me Content'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}