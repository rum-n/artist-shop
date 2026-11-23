import { ArtworkImage } from "@/types/Artwork";
import { cloudinarySrcSet, optimizedImageUrl } from "@/lib/cloudinary";

interface ArtworkThumbProps {
  images: ArtworkImage[];
  title: string;
  sizes: string;
  /** Widths offered to the browser; match them to the layout's column width. */
  widths?: number[];
  priority?: boolean;
}

/*
 * The first image sets the height — layouts here rely on natural proportions,
 * never a cropped box — and the second is laid over it and faded in on hover.
 * Artworks with a single image simply don't change.
 *
 * No hooks, so this renders in both server and client components. The swap is
 * pure CSS, which also means Tailwind wraps it in `@media (hover: hover)` and
 * it never fires on a touch device.
 */
export default function ArtworkThumb({
  images,
  title,
  sizes,
  widths = [400, 600, 800, 1200],
  priority = false,
}: ArtworkThumbProps) {
  const [primary, secondary] = images;

  if (!primary) {
    return (
      <div className="w-full aspect-[4/5] bg-primary-50 flex items-center justify-center">
        <span className="text-ink/40">No image available</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={optimizedImageUrl(primary.url, widths[widths.length - 1])}
        srcSet={cloudinarySrcSet(primary.url, widths)}
        sizes={sizes}
        alt={primary.alt || title}
        width={primary.width}
        height={primary.height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="w-full h-auto"
      />
      {secondary && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={optimizedImageUrl(secondary.url, widths[widths.length - 1])}
          srcSet={cloudinarySrcSet(secondary.url, widths)}
          sizes={sizes}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
    </div>
  );
}
