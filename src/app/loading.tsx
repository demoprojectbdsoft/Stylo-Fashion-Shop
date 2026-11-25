"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/context/SiteSettingsContext";

/** Resolves human-friendly page context from the active URL */
function getPageLabel(pathname: string | null): { label: string; emoji: string } {
  if (!pathname || pathname === "/") return { label: "Storefront", emoji: "🏪" };
  if (pathname.startsWith("/shop/")) return { label: "Product Details", emoji: "📦" };
  if (pathname.startsWith("/shop")) return { label: "Products Catalog", emoji: "🛍️" };
  if (pathname.startsWith("/cart")) return { label: "Shopping Cart", emoji: "🛒" };
  if (pathname.startsWith("/checkout")) return { label: "Secure Checkout", emoji: "🔒" };
  if (pathname.startsWith("/order-success")) return { label: "Order Receipt", emoji: "🎉" };
  if (pathname.startsWith("/track-order")) return { label: "Order Tracking", emoji: "📍" };
  if (pathname.startsWith("/store-locator")) return { label: "Store Locator", emoji: "🗺️" };
  if (pathname.startsWith("/about")) return { label: "About Us", emoji: "✨" };
  if (pathname.startsWith("/contact")) return { label: "Contact Us", emoji: "💬" };
  if (pathname.startsWith("/dashboard/admin")) return { label: "Admin Panel", emoji: "⚙️" };
  if (pathname.startsWith("/dashboard/customer")) return { label: "My Dashboard", emoji: "👤" };
  if (pathname.startsWith("/dashboard")) return { label: "Dashboard", emoji: "📊" };
  if (pathname.startsWith("/auth/login")) return { label: "Sign In", emoji: "🔑" };
  if (pathname.startsWith("/auth/register")) return { label: "Create Account", emoji: "🚀" };
  return { label: "Loading", emoji: "⚡" };
}

export default function Loading() {
  const { settings } = useSiteSettings();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Ease toward 90% quickly, then hold for the real load.
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) { clearInterval(timer); return prev; }
        const jump = prev < 40 ? 7 : prev < 70 ? 3 : 0.8;
        return Math.min(prev + jump, 90);
      });
    }, 90);

    return () => clearInterval(timer);
  }, []);

  const siteName = settings.siteName || "Sparq";
  const { label: pageLabel, emoji } = mounted ? getPageLabel(pathname) : { label: "Loading", emoji: "⚡" };

  // First letter of site name as monogram
  const monogram = siteName.charAt(0).toUpperCase();

  /* `fixed inset-0` already is the viewport; the old `h-screen w-screen`
     measured 100vw/100vh on top of it, which is wider and taller than the
     visible area on a phone and made the loading screen itself scrollable. */
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[var(--background)] flex flex-col items-center justify-center select-none">

      {/* ── Soft brand wash behind the mark ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(55% 48% at 50% 34%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 72%)",
        }}
      />

      {/* ── Faint dot texture, fading out toward the edges ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)",
          backgroundSize: "22px 22px",
          WebkitMaskImage: "radial-gradient(circle at 50% 44%, #000 0%, transparent 66%)",
          maskImage: "radial-gradient(circle at 50% 44%, #000 0%, transparent 66%)",
        }}
      />

      {/* ── Corner glows ── */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center gap-7 w-full max-w-sm px-6">

        {/* ── Letter mark inside a rotating ring ── */}
        <div className="relative flex items-center justify-center">
          {/* Halo breathing behind the mark */}
          <div className="absolute h-32 w-32 rounded-full bg-primary/10 blur-2xl animate-pulse" />

          {/* Outer rotating segmented ring */}
          <svg
            className="absolute w-28 h-28 animate-[spin_3s_linear_infinite]"
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
            className="absolute w-20 h-20 animate-[spin_2s_linear_infinite_reverse]"
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

          {/* Center monogram tile */}
          <div
            className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover, var(--primary)))" }}
          >
            {monogram}
            {/* Shine overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent" />
          </div>
        </div>

        {/* ── Site name and the page being opened ── */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)]">
            {siteName}
          </h1>

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-color)] shadow-xs backdrop-blur-sm">
            <span className="text-sm leading-none">{emoji}</span>
            <span className="text-xs font-semibold text-[var(--foreground-muted)] tracking-wide">
              {pageLabel}
            </span>
          </div>
        </div>

        {/* ── Slim progress track ── */}
        <div className="w-full h-[3px] bg-[var(--surface-alt)] rounded-full overflow-hidden">
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
