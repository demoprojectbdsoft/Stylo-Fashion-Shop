import React from "react";

/**
 * The storefront hero band, shared by the vendor directory and the shop page.
 *
 * Both pages open with the same storefront window — a badge, a headline, one
 * sentence of copy and a row of live chips — because the two are the same
 * promise in different aisles: the directory says who is trading, the shop
 * says what they sell. The words are the caller's; the frame is this file.
 */
export default function MarketplaceHeroBand({
  badgeIcon,
  badgeText,
  title,
  description,
  chips,
}: {
  badgeIcon: React.ReactNode;
  badgeText: string;
  title: React.ReactNode;
  description: string;
  chips?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--surface-elevated)] px-6 py-8 md:px-10 md:py-10 shadow-2xs">
      {/* Two soft lights behind the words, so the band reads as a storefront window */}
      <div className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-10 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold tracking-wide uppercase">
          {badgeIcon}
          {badgeText}
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
          {title}
        </h1>
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">{description}</p>
        {chips && <div className="flex items-center gap-2 flex-wrap pt-1">{chips}</div>}
      </div>
    </div>
  );
}
