// A type alias rather than an interface: Prisma's Json[] input requires an
// implicit index signature, which TypeScript only grants to aliases.
export type ArtworkImage = {
  url: string;
  alt: string;
  /** Pixel dimensions from Cloudinary; absent on images uploaded before these
   * were stored, in which case the browser measures the image instead. */
  width?: number;
  height?: number;
};

export interface Artwork {
  id: string;
  title: string;
  slug: string;
  price: number;
  medium: string;
  year: number;
  images?: ArtworkImage[];
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
  images: ArtworkImage[];
}

export interface Series {
  id: string;
  name: string;
  slug: string;
  description: { [key: string]: string };
  order: number;
}
