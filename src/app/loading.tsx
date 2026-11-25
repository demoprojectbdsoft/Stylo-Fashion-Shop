"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

/**
 * What the reader is opening, in their words.
 *
 * `kind` picks the section-flavoured copy that leads the rotating lines, so the
 * screen reads about the section the reader asked for rather than the same few
 * lines everywhere. The label itself is the location they are standing in.
 */
type SectionKind = "catalog" | "product" | "cart" | "dashboard" | "generic";

function getPageContext(pathname: string | null): {
  label: string;
  emoji: string;
  kind: SectionKind;
} {
  if (!pathname || pathname === "/") return { label: "Storefront", emoji: "🏪", kind: "catalog" };
  if (pathname.startsWith("/shop/")) return { label: "Product Details", emoji: "📦", kind: "product" };
  if (pathname.startsWith("/shop")) return { label: "Products Catalog", emoji: "🛍️", kind: "catalog" };
  if (pathname.startsWith("/vendors")) return { label: "Vendors", emoji: "🏬", kind: "catalog" };
  if (pathname.startsWith("/cart")) return { label: "Shopping Cart", emoji: "🛒", kind: "cart" };
  if (pathname.startsWith("/checkout")) return { label: "Secure Checkout", emoji: "🔒", kind: "cart" };
  if (pathname.startsWith("/order-success")) return { label: "Order Receipt", emoji: "🎉", kind: "cart" };
  if (pathname.startsWith("/track-order")) return { label: "Order Tracking", emoji: "📍", kind: "dashboard" };
  if (pathname.startsWith("/store-locator")) return { label: "Store Locator", emoji: "🗺️", kind: "generic" };
  if (pathname.startsWith("/about")) return { label: "About Us", emoji: "✨", kind: "generic" };
  if (pathname.startsWith("/contact")) return { label: "Contact Us", emoji: "💬", kind: "generic" };
  if (pathname.startsWith("/dashboard/admin")) return { label: "Admin Panel", emoji: "⚙️", kind: "dashboard" };
  if (pathname.startsWith("/dashboard/customer")) return { label: "My Dashboard", emoji: "👤", kind: "dashboard" };
  if (pathname.startsWith("/dashboard")) return { label: "Dashboard", emoji: "📊", kind: "dashboard" };
  if (pathname.startsWith("/auth/login")) return { label: "Sign In", emoji: "🔑", kind: "generic" };
  if (pathname.startsWith("/auth/register")) return { label: "Create Account", emoji: "🚀", kind: "generic" };
  return { label: "Loading", emoji: "⚡", kind: "generic" };
}

/** The section's own opening lines, so the copy reads about what was asked for. */
const SECTION_LINES: Record<SectionKind, string[]> = {
  catalog: ["Rounding up every shop on the marketplace", "Weighing prices across the vendors"],
  product: ["Opening the full spec sheet", "Checking stock and today's offer"],
  cart: ["Adding up your basket", "Re-checking the coupon and the shipping"],
  dashboard: ["Tallying your orders and earnings", "Pulling together your latest numbers"],
  generic: ["Getting things ready for you"],
};

/** Lines about the store itself, shown alongside the section's own. */
function siteLines(siteName: string): string[] {
  return [
    `${siteName} runs on real sellers and honest records`,
    "Every price is checked on the server, never guessed",
    "Fresh arrivals and today's offers are on the way",
    "From shelf to doorstep, the whole trip is tracked",
    "Loyalty points, warranties and verified reviews",
    "One clean checkout across every vendor",
    "Your cart and saved details stay safe with us",
    "Fast delivery on every qualifying order",
  ];
}

export default function Loading() {
  const { settings } = useSiteSettings();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Ease toward 90% quickly, then hold for the real load.
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) { clearInterval(progressTimer); return prev; }
        const jump = prev < 40 ? 7 : prev < 70 ? 3 : 0.8;
        return Math.min(prev + jump, 90);
      });
    }, 90);

    // Roll the copy so the wait has something to read.
    const lineTimer = setInterval(() => setTick((t) => t + 1), 2000);

    return () => { clearInterval(progressTimer); clearInterval(lineTimer); };
  }, []);

  const siteName = settings.siteName || "Sparq";
  const logo = settings.navbarLogo?.light || settings.navbarLogo?.dark || "";
  const { label: pageLabel, emoji, kind } = mounted
    ? getPageContext(pathname)
    : { label: "Loading", emoji: "⚡", kind: "generic" as SectionKind };

  // A window of the section's own lines plus the store's, so both are always read.
  const pool = [...SECTION_LINES[kind], ...siteLines(siteName)];
  const visible = Array.from({ length: Math.min(3, pool.length) }, (_, i) => pool[(tick + i) % pool.length]);

  /* `fixed inset-0` already is the viewport; the old `h-screen w-screen`
     measured 100vw/100vh on top of it, which is wider and taller than the
     visible area on a phone and made the loading screen itself scrollable. */
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[var(--background)] flex flex-col items-center justify-center select-none">

      {/* ── Soft brand wash behind the panel ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(55% 48% at 50% 38%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 72%)",
        }}
      />

      {/* ── Faint dot texture, fading out toward the edges ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)",
          backgroundSize: "22px 22px",
          WebkitMaskImage: "radial-gradient(circle at 50% 48%, #000 0%, transparent 68%)",
          maskImage: "radial-gradient(circle at 50% 48%, #000 0%, transparent 68%)",
        }}
      />

      {/* ── Corner glows ── */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      {/* ── Panel ── */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 px-6">

        {/* Brand: the store's own logo in a breathing ring. No letter mark. */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute h-28 w-28 rounded-full bg-primary/10 blur-2xl animate-pulse" />

          {/* Outer rotating segmented ring */}
          <svg
            className="absolute h-24 w-24 animate-[spin_3.5s_linear_infinite]"
            viewBox="0 0 100 100"
            fill="none"
          >
            <circle cx="50" cy="50" r="45" stroke="var(--border-color)" strokeWidth="2" />
            <circle
              cx="50" cy="50" r="45"
              stroke="var(--primary)"
              strokeWidth="2.5"
              strokeDasharray="50 232"
              strokeLinecap="round"
            />
          </svg>

          {/* Inner counter-rotating arc */}
          <svg
            className="absolute h-16 w-16 animate-[spin_2.2s_linear_infinite_reverse]"
            viewBox="0 0 100 100"
            fill="none"
          >
            <circle
              cx="50" cy="50" r="45"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeDasharray="20 262"
              strokeOpacity="0.4"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[var(--surface-elevated)] shadow-xl">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt={siteName}
                className="h-full w-full object-contain p-1.5"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
          </div>
        </div>

        {/* Site name + where the reader is */}
        <div className="flex flex-col items-center gap-2.5 text-center">
          <h1 className="text-2xl font-black tracking-tight text-[var(--foreground)]">{siteName}</h1>

          {/* The location: the page being opened, in the reader's terms */}
          <div className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--surface-elevated)] px-4 py-1.5 shadow-xs">
            <span className="text-sm leading-none">{emoji}</span>
            <span className="text-xs font-semibold tracking-wide text-[var(--foreground-muted)]">
              Opening {pageLabel}
            </span>
          </div>
        </div>

        {/* Rotating lines about the section and the store, kept true while loading */}
        <div className="flex min-h-[5.75rem] w-full flex-col items-center justify-center gap-1.5 text-center">
          {visible.map((line, i) => (
            <p
              key={`${tick}-${i}`}
              className={`animate-[loaderLineIn_0.55s_ease-out_both] text-[12px] leading-snug sm:text-[13px] ${
                i === 0
                  ? "font-semibold text-[var(--foreground)]"
                  : "text-[var(--foreground-muted)]"
              }`}
              style={{ animationDelay: `${i * 110}ms` }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Progress track */}
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--surface-alt)]">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--primary), var(--primary-hover, var(--primary)))",
              boxShadow: "0 0 8px var(--primary)",
            }}
          />
        </div>

      </div>

    </div>
  );
}
