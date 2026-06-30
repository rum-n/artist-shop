"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AdminNavbar from "@/components/AdminNavbar";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader";
import { toast } from "react-hot-toast";
import { ArtworkFormData, Series } from "@/types/Artwork";

export default function NewArtwork() {
  const { status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/admin/login");
  }

  const [formData, setFormData] = useState<ArtworkFormData>({
    title: "",
    slug: "",
    description: { en: "", bg: "" },
    price: 0,
    medium: "",
    year: new Date().getFullYear(),
    width: 0,
    height: 0,
    unit: "in",
    inStock: true,
    featured: false,
    seriesId: "",
    images: [],
  });

  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/series")
      .then((res) => res.json())
      .then((data) => setSeriesList(data.series || []))
      .catch((err) => console.error("Error loading series:", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    lang?: string
  ) => {
    const { name, value, type } = e.target;

    if (name.startsWith("description-") && lang) {
      setFormData({
        ...formData,
        description: {
          ...formData.description,
          [lang]: value,
        },
      });
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });

      if (name === "title") {
        setFormData({
          ...formData,
          title: value,
          slug: value
            .toLowerCase()
            .replace(/[^\w\s]/gi, "")
            .replace(/\s+/g, "-"),
        });
      }
    }
  };

  const handleImageUpload = (url: string) => {
    if (formData.images.length >= 3) {
      toast.error("Maximum of 3 images allowed per artwork");
      return;
    }

    setFormData({
      ...formData,
      images: [...formData.images, { url, alt: formData.title }],
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages,
    });
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...formData.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setFormData({
      ...formData,
      images: newImages,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "description") {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key !== "images") {
          formDataToSend.append(key, value.toString());
        }
      });

      for (const image of formData.images) {
        const response = await fetch(image.url);
        const blob = await response.blob();
        formDataToSend.append(`image-${image.url}`, blob);
      }

      const response = await fetch("/api/artwork", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create artwork");
      }

      router.push("/admin/artworks");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl mb-6">Add New Artwork</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Used in the URL, auto-generated from title
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Description *</label>
              {Object.keys(formData.description).map((lang) => (
                <div key={lang} className="mb-4">
                  <label
                    htmlFor={`description-${lang}`}
                    className="block text-sm text-gray-600"
                  >
                    Description ({lang.toUpperCase()})
                  </label>
                  <textarea
                    id={`description-${lang}`}
                    name={`description-${lang}`}
                    value={formData.description[lang]}
                    onChange={(e) => handleChange(e, lang)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="price" className="block text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="medium" className="block text-gray-700 mb-2">
                Medium *
              </label>
              <input
                type="text"
                id="medium"
                name="medium"
                value={formData.medium}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="year" className="block text-gray-700 mb-2">
                Year *
              </label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label htmlFor="width" className="block text-gray-700 mb-2">
                  Width *
                </label>
                <input
                  type="number"
                  id="width"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="col-span-1">
                <label htmlFor="height" className="block text-gray-700 mb-2">
                  Height *
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="col-span-1">
                <label htmlFor="unit" className="block text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="in">inches</option>
                  <option value="cm">centimeters</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="seriesId" className="block text-gray-700 mb-2">
                Series
              </label>
              <select
                id="seriesId"
                name="seriesId"
                value={formData.seriesId ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">— No series —</option>
                {seriesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Group this artwork with others in the gallery.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images ({formData.images.length}/3)
              </label>

              <div className="grid grid-cols-3 gap-4 mb-4">
                {formData.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative rounded-md overflow-hidden h-40 bg-gray-100"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || formData.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1 flex justify-between text-white">
                      <div className="flex space-x-2">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => reorderImages(index, index - 1)}
                            className="text-white hover:text-primary-300"
                            aria-label="Move left"
                          >
                            ←
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-white hover:text-red-300"
                          aria-label="Remove image"
                        >
                          ×
                        </button>

                        {index < formData.images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => reorderImages(index, index + 1)}
                            className="text-white hover:text-primary-300"
                            aria-label="Move right"
                          >
                            →
                          </button>
                        )}
                      </div>
                      {index === 0 && <span className="text-xs">Main</span>}
                    </div>
                  </div>
                ))}

                {formData.images.length < 3 && (
                  <div className="h-40">
                    <ImageUploader onUploadComplete={handleImageUpload} />
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500">
                Add up to 3 images. The first image will be shown in gallery
                listings.
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="inStock"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <label htmlFor="inStock" className="ml-2 block text-gray-700">
                Available for purchase
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-gray-700">
                Feature on homepage
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/artworks")}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-4 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Artwork"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
