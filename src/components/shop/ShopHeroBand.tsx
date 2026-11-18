"use client";

import React from "react";
import { Layers, ShoppingBag } from "lucide-react";
import MarketplaceHeroBand from "@/components/shared/MarketplaceHeroBand";
import { useSiteSettings } from "@/context/SiteSettingsContext";

/**
 * The shop page's opening band — the same storefront window the vendor
 * directory opens with, carrying the catalogue's own numbers instead.
 */
export default function ShopHeroBand({
  totalProducts,
  categoryCount,
}: {
  totalProducts: number;
  categoryCount: number;
}) {
  const { settings } = useSiteSettings();

  return (
    <MarketplaceHeroBand
      badgeIcon={<ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />}
      badgeText="The catalogue"
      title={
        <>
          Shop everything <span className="text-gradient-primary">{settings.siteName || "Sparq"}</span>{" "}
          sells
        </>
      }
      description={`Every listing on the marketplace in one aisle — search it, filter it by category, and pick how the shelves flow: numbered pages or one endless scroll.`}
      chips={
        <>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-alt)] border border-[var(--border-color)] px-3 py-1 text-[11px] font-semibold text-[var(--foreground)]">
            <ShoppingBag className="w-3.5 h-3.5 text-primary" />
            {totalProducts} {totalProducts === 1 ? "product" : "products"} in the catalogue
          </span>
          {categoryCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[11px] font-semibold text-primary">
              <Layers className="w-3.5 h-3.5" />
              {categoryCount} {categoryCount === 1 ? "category" : "categories"}
            </span>
          )}
        </>
      }
    />
  );
}
