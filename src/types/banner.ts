// A homepage hero banner. One picture and one destination; the `type` decides
// which target is meaningful and how the click is routed.

export type BannerType = "product" | "category" | "vendor" | "custom";

/** Draft (not published), scheduled, active, or past its end date. */
export type BannerStatus = "draft" | "scheduled" | "active" | "expired";

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  type: BannerType;
  desktopImage: string;
  mobileImage: string;
  ctaText: string;
  order: number;
  startDate: string | null;
  endDate: string | null;
  status: BannerStatus;
  isActive: boolean;
  target: {
    productId: string | null;
    categoryId: string | null;
    vendorId: string | null;
    customUrl: string;
  };
  /** Live pricing, only on a product banner. Null when there is no discount. */
  product?: {
    id: string | null;
    price: number;
    originalPrice: number | null;
    offerEndDate: string | null;
  } | null;
  /** The resolved link. Empty when the target has since been removed. */
  href: string;
}
