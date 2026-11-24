"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import type { Banner } from "@/types/banner";

// Fallback used when a banner's image fails to load, so the hero never shows a
// broken frame.
const FALLBACK_IMAGE =
  "https://i.ibb.co.com/Q3Tpt7Df/industries-consumer-electronics-removebg-preview.png";

interface HeroSliderProps {
  initialBanners?: Banner[];
}

/** Renders the admin's banners. Only eligible ones ever reach here. */
export default function HeroSlider({ initialBanners = [] }: HeroSliderProps) {
  const banners = Array.isArray(initialBanners) ? initialBanners.filter((b) => b.href) : [];
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const id = setInterval(() => setCurrent((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(id);
  }, [isPaused, banners.length]);

  // Keep the index valid if the list shrank between renders.
  const index = current < banners.length ? current : 0;
  const banner = banners[index];

  if (banners.length === 0) {
    return (
      <div className="w-full">
        <div className="relative bg-[var(--surface-elevated)] rounded-2xl overflow-hidden border border-[var(--border-color)] p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[320px] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-xs">
            <Megaphone className="w-6 h-6" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-xl font-extrabold text-[var(--foreground)]">Discover Exclusive Deals</h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Browse our complete catalog of products, new arrivals, and top accessories.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/25 transition-all"
          >
            <span>Explore Shop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const go = (dir: number) => setCurrent((p) => (p + dir + banners.length) % banners.length);

  return (
    <div className="w-full">
      <div
        className="relative rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-xs bg-[var(--surface-elevated)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Each banner is absolutely stacked so the cross-fade is a pure opacity change. */}
        <div className="relative h-56 sm:h-72 md:h-[420px]">
          {banners.map((b, i) => (
            <Link
              key={b.id}
              href={b.href}
              aria-hidden={i !== index}
              className={`absolute inset-0 block transition-opacity duration-700 ${
                i === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <picture>
                {b.mobileImage && <source media="(max-width: 640px)" srcSet={b.mobileImage} />}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.desktopImage || FALLBACK_IMAGE}
                  alt={b.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
              </picture>

              {/* Text overlay */}
              <div className="absolute inset-0 flex flex-col justify-center gap-2 p-6 sm:p-10 md:p-14">
                <div className="max-w-lg bg-gradient-to-r from-black/60 via-black/35 to-transparent rounded-2xl p-5 md:p-7">
                  <h3 className="text-2xl md:text-4xl font-extrabold leading-tight text-white drop-shadow">
                    {b.title}
                  </h3>
                  {b.subtitle && (
                    <p className="mt-1.5 text-xs md:text-sm text-white/90">{b.subtitle}</p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow-md shadow-primary/25">
                    {b.ctaText || "Shop Now"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Controls */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous banner"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur-xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next banner"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur-xs transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to banner ${i + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
