import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BadgeCheck, Crown, Package, Star, Store } from "lucide-react";
import type { PublicStore } from "@/types/stores";

/**
 * A shop on the marquee, drawn as a poster instead of a listing tile.
 *
 * The only shops that reach this card are the ones holding a storefront
 * placement — the week a paid plan opens, or the run the store team granted
 * from the promotions desk. That is worth a different shape from the directory
 * card: the cover takes the whole top half, the signboard sits on the picture,
 * and the delivery record is drawn as a bar so the one number that decides
 * whether a stranger buys from the shop can be read from across the page.
 *
 * `rank` is the order the rail received, printed on the ribbon so "the latest
 * placements" is visible rather than only implied by position.
 */
export default function SpotlightVendorCard({
  vendor,
  rank,
}: {
  vendor: PublicStore;
  rank?: number;
}) {
  const place = [vendor.address.area, vendor.address.city].filter(Boolean).join(", ");
  const success = Math.max(0, Math.min(100, Math.round(Number(vendor.successRate) || 0)));
  const delivered = Number(vendor.completedOrders) || 0;

  return (
    <Link
      href={`/vendors/${vendor.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-amber-500/25 bg-[var(--surface-elevated)] shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/60 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer"
    >
      {/* ── Poster: the cover, with the shop's sign laid over it ── */}
      <div className="relative h-44 shrink-0 overflow-hidden bg-brand-gradient">
        {vendor.coverImage && (
          <Image
            src={vendor.coverImage}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />

        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm">
            <Crown className="h-2.5 w-2.5" /> Spotlight
          </span>
          {typeof rank === "number" && (
            <span className="rounded-full bg-black/45 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-white/90 backdrop-blur-sm">
              {String(rank).padStart(2, "0")}
            </span>
          )}
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-end gap-2.5">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/25 bg-[var(--surface-elevated)] shadow-md">
            {vendor.logo ? (
              <Image
                src={vendor.logo}
                alt={`${vendor.name} logo`}
                fill
                sizes="44px"
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Store className="absolute inset-0 m-auto h-5 w-5 text-[var(--foreground-muted)]" />
            )}
          </div>
          <div className="min-w-0 pb-0.5">
            <h3 className="truncate text-sm font-bold leading-snug text-white">{vendor.name}</h3>
            <p className="truncate text-[10px] text-white/70">
              {vendor.category || "Marketplace shop"}
              {place && ` · ${place}`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3">
        <p className="line-clamp-2 text-[11px] leading-relaxed text-[var(--foreground-muted)]">
          {vendor.description || "A verified seller on the marketplace, currently holding the shelf."}
        </p>

        {/* ── The record, as a bar rather than a footnote ── */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Delivery success
            </span>
            <span
              className={`text-[11px] font-extrabold tabular-nums ${
                success >= 80
                  ? "text-emerald-600 dark:text-emerald-400"
                  : success > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-[var(--foreground-muted)]"
              }`}
            >
              {success > 0 ? `${success}%` : "New shop"}
            </span>
          </div>
          <div
            className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-alt)]"
            title="Delivered parcels against every parcel the shop closed"
          >
            <span
              className="block h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ width: `${success}%` }}
            />
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 text-[10px] text-[var(--foreground-muted)]">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {vendor.rating > 0 ? vendor.rating.toFixed(1) : "New"}
            {vendor.reviewCount > 0 && (
              <span className="font-normal text-[var(--foreground-muted)]">({vendor.reviewCount})</span>
            )}
          </span>
          <span className="inline-flex items-center gap-1">
            <Package className="h-3 w-3" />
            {vendor.productCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <BadgeCheck className="h-3 w-3" />
            {delivered} delivered
          </span>
          <ArrowUpRight className="ml-auto h-3.5 w-3.5 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-500" />
        </div>
      </div>
    </Link>
  );
}
