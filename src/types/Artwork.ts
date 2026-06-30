export interface Artwork {
  id: string;
  title: string;
  slug: string;
  price: number;
  medium: string;
  year: number;
  images?: { url: string; alt: string }[];
  description: { [key: string]: string };
  dimensions: {
    width: string;
    height: string;
    unit: string;
  };
  inStock: boolean;
  featured: boolean;
  seriesId?: string | null;
  createdAt: Date;
}

export interface ArtworkFormData {
  title: string;
  slug: string;
  description: { [key: string]: string };
  price: number;
  medium: string;
  year: number;
  width: number;
  height: number;
  unit: string;
  inStock: boolean;
  featured: boolean;
  seriesId?: string | null;
  images: { url: string; alt: string }[];
}

export interface Series {
  id: string;
  name: string;
  slug: string;
  description: { [key: string]: string };
  order: number;
}
