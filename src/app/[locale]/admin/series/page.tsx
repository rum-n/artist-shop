"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AdminNavbar from "@/components/AdminNavbar";
import { toast } from "react-hot-toast";
import { Series } from "@/types/Artwork";

interface SeriesFormData {
  id: string | null;
  name: string;
  slug: string;
  description: { en: string; bg: string };
  order: number;
}

const emptyForm: SeriesFormData = {
  id: null,
  name: "",
  slug: "",
  description: { en: "", bg: "" },
  order: 0,
};

export default function AdminSeries() {
  const { status } = useSession();
  const router = useRouter();

  const [series, setSeries] = useState<Series[]>([]);
  const [form, setForm] = useState<SeriesFormData>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchSeries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/series");
      const data = await res.json();
      setSeries(data.series || []);
    } catch (error) {
      console.error("Error fetching series:", error);
      toast.error("Failed to load series");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  const resetForm = () => setForm(emptyForm);

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      // Only auto-generate the slug while creating a new series.
      slug: prev.id
        ? prev.slug
        : value
            .toLowerCase()
            .replace(/[^\w\s]/gi, "")
            .replace(/\s+/g, "-"),
    }));
  };

  const handleEdit = (s: Series) => {
    setForm({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: {
        en: s.description?.en || "",
        bg: s.description?.bg || "",
      },
      order: s.order ?? 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (s: Series) => {
    if (
      !confirm(
        `Delete series "${s.name}"? Artworks in it will keep existing but become unassigned.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/series/${s.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete series");
      }
      toast.success("Series deleted");
      if (form.id === s.id) resetForm();
      fetchSeries();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(
        form.id ? `/api/series/${form.id}` : "/api/series",
        {
          method: form.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            description: form.description,
            order: form.order,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save series");
      }
      toast.success(form.id ? "Series updated" : "Series created");
      resetForm();
      fetchSeries();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl mb-6">Series</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create / edit form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 lg:col-span-1 h-fit"
          >
            <h2 className="text-xl mb-4">
              {form.id ? "Edit series" : "New series"}
            </h2>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Description (EN)
              </label>
              <textarea
                value={form.description.en}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: { ...prev.description, en: e.target.value },
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Description (BG)
              </label>
              <textarea
                value={form.description.bg}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: { ...prev.description, bg: e.target.value },
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Display order
              </label>
              <input
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    order: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-sm text-gray-500 mt-1">
                Lower numbers appear first in the gallery.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : form.id
                  ? "Update series"
                  : "Create series"}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : series.length === 0 ? (
              <p className="text-gray-600">
                No series yet. Create your first one on the left.
              </p>
            ) : (
              <div className="space-y-3">
                {series.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex justify-between items-start"
                  >
                    <div>
                      <h3 className="text-lg">{s.name}</h3>
                      <p className="text-sm text-gray-500">/{s.slug}</p>
                      {s.description?.en && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {s.description.en}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0 ml-4">
                      <button
                        onClick={() => handleEdit(s)}
                        className="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
