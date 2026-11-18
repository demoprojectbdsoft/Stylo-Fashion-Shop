"use client";

import Image from "next/image";

/**
 * A storefront picture that hides itself instead of showing a broken tile.
 *
 * `next/image` is a client component, so an `onError` handler may only be
 * attached from client code — a server page that passes one throws while the
 * flight stream is serialized and lands the shopper on the error screen. This
 * wrapper owns the handler so server pages (like a vendor's storefront) can
 * keep rendering their own rows.
 */
export default function StoreImage({
  src,
  alt,
  fill = true,
  priority = false,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
