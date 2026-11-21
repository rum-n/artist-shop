'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '@/lib/apiError';
import { ArtworkImage } from '@/types/Artwork';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

interface ImageUploaderProps {
  onUploadComplete: (image: Omit<ArtworkImage, 'alt'>) => void;
}

export default function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size. The hosting platform rejects request bodies over
    // 4.5MB before the route runs, so cap below that.
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Image must be less than 4MB');
      return;
    }

    setIsUploading(true);
    setProgress(10);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, 'Failed to upload image')
        );
      }

      setProgress(90);
      const data = await response.json();
      onUploadComplete({
        url: data.url,
        width: data.width,
        height: data.height,
      });
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload image'
      );
    } finally {
      setIsUploading(false);
      setProgress(0);
      e.target.value = '';
    }
  };

  // Simulate progress for better user experience
  if (isUploading) {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        if (newProgress >= 90) {
          clearInterval(interval);
          return 90;
        }
        return newProgress;
      });
    }, 300);
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
      {isUploading ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Uploading...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <>
          <label
            htmlFor="image-upload"
            className="cursor-pointer block p-4 text-gray-500"
          >
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-1 text-sm">Click to upload an image</p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 4MB</p>
          </label>
          <input
            id="image-upload"
            name="image"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
}