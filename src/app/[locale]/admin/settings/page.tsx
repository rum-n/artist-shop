'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminNavbar from '@/components/AdminNavbar';
import dynamic from 'next/dynamic';

import { getErrorMessage } from '@/lib/apiError';
import { OPEN_SHOP, ShopStatus, parseShopStatus } from '@/lib/shopStatus';
import {
  InstagramPost,
  MAX_INSTAGRAM_POSTS,
  parseInstagramPosts,
} from '@/lib/instagram';
import ImageUploader from '@/components/ImageUploader';
import Image from 'next/image';

const ClientMDXEditor = dynamic(() => import('@/components/ClientMDXEditor'), {
  ssr: false,
});

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export default function SiteSettings() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [currentHeroImage, setCurrentHeroImage] = useState<string | null>(null);
  const [aboutMeContent, setAboutMeContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [homepageContent, setHomepageContent] = useState('');
  const [shopStatus, setShopStatus] = useState<ShopStatus>(OPEN_SHOP);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);

  /*
   * MDXEditor is uncontrolled: it reads `markdown` once, on mount, and ignores
   * later changes to it. So the editors must not be rendered until their
   * content has arrived — otherwise they mount empty, and saving writes that
   * empty value over whatever was stored.
   */
  useEffect(() => {
    const load = async () => {
      const [heroResult, aboutResult, homepageResult, shopResult, instagramResult] =
        await Promise.allSettled([
          fetch('/api/settings/hero-image').then((r) => r.json()),
          fetch('/api/settings/about-me').then((r) => r.json()),
          fetch('/api/settings/homepage-content').then((r) => r.json()),
          fetch('/api/settings/shop-status').then((r) => r.json()),
          fetch('/api/settings/instagram').then((r) => r.json()),
        ]);

      if (heroResult.status === 'fulfilled') {
        setCurrentHeroImage(heroResult.value.imageUrl ?? null);
      } else {
        console.error('Error fetching hero image:', heroResult.reason);
      }

      if (aboutResult.status === 'fulfilled') {
        setAboutMeContent(aboutResult.value.content || '');
      } else {
        console.error('Error fetching about me content:', aboutResult.reason);
      }

      if (homepageResult.status === 'fulfilled') {
        setHomepageContent(homepageResult.value.content || '');
      } else {
        console.error('Error fetching homepage content:', homepageResult.reason);
      }

      if (shopResult.status === 'fulfilled') {
        setShopStatus(parseShopStatus(shopResult.value.shopStatus));
      } else {
        console.error('Error fetching shop status:', shopResult.reason);
      }

      if (instagramResult.status === 'fulfilled') {
        setInstagramPosts(parseInstagramPosts(instagramResult.value.posts));
      } else {
        console.error('Error fetching photo strip:', instagramResult.reason);
      }

      // Only now is it safe to mount the editors.
      setEditorLoaded(true);
    };

    load();
  }, []);

  const handleInstagramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/settings/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts: instagramPosts }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, 'Failed to update the photo strip')
        );
      }

      // The server drops rows missing an image or a link, so reflect back
      // exactly what was stored rather than what was on screen.
      const data = await response.json();
      setInstagramPosts(parseInstagramPosts(data.posts));
      setSuccessMessage('Photo strip updated');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update the photo strip'
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShopStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/settings/shop-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopStatus),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, 'Failed to update the shop status')
        );
      }

      setSuccessMessage(
        shopStatus.closed ? 'The shop is now closed' : 'The shop is now open'
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update the shop status'
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // The hosting platform rejects request bodies over 4.5MB before the
      // route runs, so refuse oversized files up front.
      if (file.size > MAX_IMAGE_BYTES) {
        setHeroImage(null);
        e.target.value = '';
        setError('Image must be less than 4MB');
        return;
      }

      setError('');
      setHeroImage(file);
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
        throw new Error(
          await getErrorMessage(response, 'Failed to update hero image')
        );
      }

      const data = await response.json();
      setCurrentHeroImage(data.imageUrl);
      setSuccessMessage('Hero image updated successfully');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred while updating the hero image'
      );
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

  const handleHomepageContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/settings/homepage-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: homepageContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to update homepage content');
      }

      setSuccessMessage('Homepage content updated successfully');
    } catch (error) {
      setError('An error occurred while updating the homepage content');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl mb-6">Site Settings</h1>

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
          <h2 className="text-xl mb-4">Instagram photo strip</h2>
          <p className="text-sm text-gray-600 mb-4">
            Shown as a band just above the footer. Upload the photo here (do not
            paste an Instagram image address — those expire) and give the post it
            should link to. Rows without both are discarded on save.
          </p>

          <form onSubmit={handleInstagramSubmit}>
            <div className="space-y-4 mb-4">
              {instagramPosts.map((post, index) => (
                <div key={index} className="flex items-start gap-4 border border-gray-200 p-3 rounded-md">
                  <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100">
                    {post.image ? (
                      <Image src={post.image} alt="" fill className="object-cover" />
                    ) : (
                      <ImageUploader
                        onUploadComplete={(image) =>
                          setInstagramPosts(
                            instagramPosts.map((p, i) =>
                              i === index ? { ...p, image: image.url } : p
                            )
                          )
                        }
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Link to the post
                    </label>
                    <input
                      type="url"
                      value={post.url}
                      placeholder="https://www.instagram.com/p/..."
                      onChange={(e) =>
                        setInstagramPosts(
                          instagramPosts.map((p, i) =>
                            i === index ? { ...p, url: e.target.value } : p
                          )
                        )
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setInstagramPosts(instagramPosts.filter((_, i) => i !== index))
                    }
                    className="text-gray-500 hover:text-red-600"
                    aria-label="Remove photo"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {instagramPosts.length < MAX_INSTAGRAM_POSTS && (
              <button
                type="button"
                onClick={() =>
                  setInstagramPosts([...instagramPosts, { image: '', url: '' }])
                }
                className="mb-4 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
              >
                Add a photo
              </button>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:bg-gray-400"
              >
                {isSubmitting ? 'Saving...' : 'Save photo strip'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <h2 className="text-xl mb-4">Shop status</h2>

          <form onSubmit={handleShopStatusSubmit}>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="shopClosed"
                checked={shopStatus.closed}
                onChange={(e) =>
                  setShopStatus({ ...shopStatus, closed: e.target.checked })
                }
                className="h-4 w-4 border-gray-300 rounded"
              />
              <label htmlFor="shopClosed" className="ml-2 block text-gray-700">
                Close the shop (nothing can be bought while this is on)
              </label>
            </div>

            {(['en', 'bg'] as const).map((lang) => (
              <div key={lang} className="mb-4">
                <label
                  htmlFor={`shopMessage-${lang}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Message shown while closed ({lang.toUpperCase()})
                </label>
                <textarea
                  id={`shopMessage-${lang}`}
                  value={shopStatus.message[lang] || ''}
                  onChange={(e) =>
                    setShopStatus({
                      ...shopStatus,
                      message: { ...shopStatus.message, [lang]: e.target.value },
                    })
                  }
                  rows={3}
                  placeholder="e.g. The shop is closed until 15 January."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Saving...' : 'Save shop status'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl mb-4">Homepage Content</h2>

          <form onSubmit={handleHomepageContentSubmit}>
            <div className="mb-4">
              <div className="border border-gray-300 rounded-md overflow-hidden">
                {editorLoaded ? (
                  <ClientMDXEditor
                    markdown={homepageContent}
                    onChange={setHomepageContent}
                  />
                ) : (
                  <div className="flex justify-center items-center h-[400px] bg-gray-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:bg-gray-400 mt-4"
            >
              {isSubmitting ? 'Saving...' : 'Update Homepage Content'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <h2 className="text-xl mb-4">Hero Image</h2>

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
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Uploading...' : 'Update Hero Image'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl mb-4">About Me Content</h2>

          <form onSubmit={handleAboutMeSubmit}>
            <div className="mb-4">
              <div className="border border-gray-300 rounded-md overflow-hidden">
                {editorLoaded ? (
                  <ClientMDXEditor
                    markdown={aboutMeContent}
                    onChange={setAboutMeContent}
                  />
                ) : (
                  <div className="flex justify-center items-center h-[400px] bg-gray-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:bg-gray-400 mt-4"
            >
              {isSubmitting ? 'Saving...' : 'Update About Me Content'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}