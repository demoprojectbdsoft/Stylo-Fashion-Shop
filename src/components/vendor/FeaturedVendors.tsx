import Link from "next/link";
import { ChevronRight, Crown } from "lucide-react";
import SpotlightVendorCard from "./SpotlightVendorCard";
import type { PublicStore } from "@/types/stores";

/**
 * The featured-vendors shelf.
 *
 * The rows are the shops holding a storefront placement right now: the week a
 * paid plan opens when its period starts, or the run the store team granted
 * from the promotions desk. Nothing else puts a shop here — a featured listing
 * does not carry its seller along.
 *
 * That is why the card is not the directory's card: a sponsored shop gets the
 * poster from `SpotlightVendorCard`, so the rail reads as a marquee rather than
 * a second copy of the vendor list. The header is the same one every other
 * homepage section draws, and the words are the caller's.
 *
 * When nothing is promoted the section is not rendered at all — an empty
 * "Featured" header over an empty box would advertise a feature the marketplace
 * does not currently have.
 */
export default function FeaturedVendors({
  vendors,
  eyebrow = "On the marquee",
  title = "Featured Vendors",
  slogan = "The shops holding the marquee right now — a week bought with a paid plan, or a run the store team granted. Verified sellers, real delivery records.",
  href = "/vendors",
  linkLabel = "All vendors",
}: {
  vendors: PublicStore[];
  eyebrow?: string;
  title?: string;
  slogan?: string;
  href?: string;
  linkLabel?: string;
}) {
  if (vendors.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 my-10">
      {/* ── Section header, the same one the other homepage sections draw ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--border-color)] pb-3 mb-6 gap-3">
        <div className="relative inline-block min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl md:text-2xl font-light text-[var(--foreground)]">{title}</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/25 dark:text-amber-400">
              <Crown className="w-3 h-3" /> {eyebrow}
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-[var(--foreground-muted)]">
            {slogan}
          </p>
          <div className="absolute -bottom-[13px] left-0 w-full h-[2.5px] bg-gradient-to-r from-primary to-primary-hover rounded-full" />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
            {vendors.length} shop{vendors.length === 1 ? "" : "s"} in the spotlight
          </span>
          <Link
            href={href}
            className="group text-xs text-[var(--foreground-muted)] hover:text-primary transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>{linkLabel}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── The sponsored shops, as posters ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {vendors.map((vendor, index) => (
          <SpotlightVendorCard key={vendor._id} vendor={vendor} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}
