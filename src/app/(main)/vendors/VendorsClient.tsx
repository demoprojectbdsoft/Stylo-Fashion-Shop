"use client";

import React, { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, ListBox, Pagination } from "@heroui/react";
import {
  ArrowUp,
  CheckCircle2,
  Crown,
  FileDigit,
  Infinity as InfinityIcon,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  Store,
  TriangleAlert,
  X,
} from "lucide-react";
import VendorCard from "@/components/vendor/VendorCard";
import VendorCardSkeleton from "@/components/vendor/VendorCardSkeleton";
import MarketplaceHeroBand from "@/components/shared/MarketplaceHeroBand";
import { getPublicStores } from "@/lib/api/stores";
import type { PublicStore } from "@/types/stores";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface VendorsClientProps {
  vendors: PublicStore[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  categories: string[];
}

const SORTS = [
  { key: "featured", label: "Featured first" },
  { key: "latest", label: "Latest placements" },
  { key: "rating", label: "Best rated" },
  { key: "newest", label: "Newest shops" },
  { key: "popular", label: "Most orders" },
];

/**
 * The vendor directory.
 *
 * The URL is the state: search, category, sort, page and browse mode all live
 * in the query string, so a filtered list is a link, the back button behaves,
 * and the server's first render already shows the right rows. The controls are
 * the shop page's — a debounced search box, HeroUI dropdowns for the filters
 * and a pagination / infinite-scroll switch — so the two directories read the
 * same way.
 */
export default function VendorsClient({ vendors, pagination, categories }: VendorsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { settings } = useSiteSettings();

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentFeatured = searchParams.get("featured") === "true";
  const currentSort = searchParams.get("sort") || "featured";

  const { page, limit, total, totalPages } = pagination;

  // ── Mode State: "pagination" | "scroll" ──────────────────────────────────────
  const [mode, setMode] = useState<"pagination" | "scroll">("pagination");

  // Read initial preference: URL param -> saved vendor preference -> shop default
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "scroll" || urlMode === "pagination") {
      setMode(urlMode);
      return;
    }
    try {
      const savedMode = localStorage.getItem("sparq_vendor_browse_mode");
      if (savedMode === "scroll" || savedMode === "pagination") {
        setMode(savedMode);
        return;
      }
    } catch {
      // ignore
    }
    if (settings?.shopBrowseMode) {
      setMode(settings.shopBrowseMode);
    }
  }, [searchParams, settings?.shopBrowseMode]);

  // Detect any active filter for the Clear All button
  const hasAnyFilter = Boolean(
    currentSearch || currentCategory || currentFeatured || (currentSort && currentSort !== "featured")
  );

  // ── URL helpers ─────────────────────────────────────────────────────────────
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || v === "featured") params.delete(k);
      else params.set(k, v);
    });
    startTransition(() => router.push(`/vendors?${params.toString()}`, { scroll: false }));
  };

  const handleModeChange = (newMode: "pagination" | "scroll") => {
    if (newMode === mode) return;
    setMode(newMode);
    try {
      localStorage.setItem("sparq_vendor_browse_mode", newMode);
    } catch {
      // ignore
    }
    const params = new URLSearchParams(searchParams.toString());
    if (newMode === "scroll") {
      params.set("mode", "scroll");
      params.delete("page"); // infinite scroll starts from page 1
    } else {
      params.delete("mode");
    }
    startTransition(() => {
      router.replace(`/vendors?${params.toString()}`, { scroll: false });
    });
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    startTransition(() => router.push(`/vendors?${params.toString()}`, { scroll: false }));
  };

  // ── Search (debounced, like the shop's top bar) ─────────────────────────────
  const [localSearch, setLocalSearch] = useState(currentSearch);
  useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    if (localSearch === currentSearch) return;
    const timer = setTimeout(() => {
      updateParams({ search: localSearch || null, page: null });
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch]);

  // ── Infinite Scroll State ────────────────────────────────────────────────────
  const [infiniteVendors, setInfiniteVendors] = useState<PublicStore[]>(vendors);
  const [infinitePage, setInfinitePage] = useState<number>(page || 1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(page < totalPages);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Sync infiniteVendors when the server's rows change (filters, category, sort, search)
  useEffect(() => {
    setInfiniteVendors(vendors);
    setInfinitePage(page || 1);
    setHasMore((page || 1) < totalPages);
  }, [vendors, totalPages, page]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = infinitePage + 1;

    try {
      const queryObj: Record<string, string> = {};
      searchParams.forEach((val, key) => {
        if (key !== "page" && key !== "mode") queryObj[key] = val;
      });
      const res = await getPublicStores({
        search: queryObj.search || undefined,
        category: queryObj.category || undefined,
        featured: queryObj.featured === "true" ? true : undefined,
        sort: queryObj.sort || "featured",
        page: nextPage,
        limit: 12,
      });
      const incoming: PublicStore[] = res?.data?.stores || [];
      const newTotalPages: number = res?.data?.pagination?.totalPages ?? totalPages;

      setInfiniteVendors((prev) => {
        const existingIds = new Set(prev.map((v) => v._id));
        const uniqueIncoming = incoming.filter((v) => !existingIds.has(v._id));
        return [...prev, ...uniqueIncoming];
      });

      setInfinitePage(nextPage);
      setHasMore(nextPage < newTotalPages);
    } catch (err) {
      console.error("Failed to load more vendors:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, infinitePage, searchParams, totalPages]);

  // IntersectionObserver for auto-scrolling
  useEffect(() => {
    if (mode !== "scroll" || !hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { root: null, rootMargin: "350px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [mode, hasMore, isLoadingMore, loadMore]);

  // ── Derived counts ──────────────────────────────────────────────────────────
  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);
  const featuredOnPage = vendors.filter((vendor) => vendor.isFeatured).length;

  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    pages.push(1);
    if (page > 3) pages.push("ellipsis");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("ellipsis");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const displayedVendors = mode === "scroll" ? infiniteVendors : vendors;
  const progressPercent =
    total > 0 ? Math.min(100, Math.round((displayedVendors.length / total) * 100)) : 100;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-10 space-y-6">
      {/* ── Hero band ── */}
      <MarketplaceHeroBand
        badgeIcon={<Store className="w-3.5 h-3.5 stroke-[2.2]" />}
        badgeText="The marketplace"
        title={
          <>
            Meet the <span className="text-gradient-primary">vendors</span>
          </>
        }
        description={`Every independent seller trading on ${settings.siteName || "Sparq"} right now. Each shopfront carries the numbers the platform keeps honest — its rating, the parcels it delivered, and how many of those actually arrived — so you can pick where to buy from the record, not the pitch.`}
        chips={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-alt)] border border-[var(--border-color)] px-3 py-1 text-[11px] font-semibold text-[var(--foreground)]">
              <Store className="w-3.5 h-3.5 text-primary" />
              {pagination.total} {pagination.total === 1 ? "vendor" : "vendors"} trading
            </span>
            {featuredOnPage > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-300/60 dark:border-amber-600/50 px-3 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                <Crown className="w-3.5 h-3.5" />
                {featuredOnPage} featured on this page
              </span>
            )}
          </>
        }
      />

      {/* ── Search & filter top bar, the shop page's shape ── */}
      <div className="w-full bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border-color)] shadow-xs p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)] pointer-events-none z-10" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search vendors by name, description or category..."
                className="w-full h-10 sm:h-11 pl-9 sm:pl-10 pr-9 sm:pr-10 text-xs sm:text-sm rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch("");
                    updateParams({ search: null, page: null });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Results count + Clear All button */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary whitespace-nowrap">
                <span className="font-bold mr-1">{pagination.total}</span> vendors
                {isPending && (
                  <span className="ml-1.5 animate-pulse text-[var(--foreground-muted)]">…</span>
                )}
              </div>

              {hasAnyFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch("");
                    startTransition(() => router.push("/vendors", { scroll: false }));
                  }}
                  className="flex items-center gap-1.5 h-10 sm:h-11 px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 dark:hover:bg-red-500 dark:hover:border-red-500 dark:hover:text-white transition-all cursor-pointer whitespace-nowrap group"
                >
                  <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-180 transition-transform duration-500" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Category, sort and featured — HeroUI selects plus one chip */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Category Dropdown */}
            <div className="order-1 grow-0 basis-[calc(50%-4px)] sm:flex-initial min-w-[130px] sm:min-w-[165px]">
              <Select
                aria-label="Filter by Category"
                selectedKey={currentCategory || "all"}
                onSelectionChange={(key) =>
                  updateParams({ category: key === "all" ? null : String(key || ""), page: null })
                }
              >
                <Select.Trigger className="h-10 sm:h-11 w-full px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-between gap-1.5 cursor-pointer hover:border-primary transition-colors shadow-xs [&>span]:text-xs [&>span]:font-semibold">
                  <Select.Value className="text-xs font-semibold truncate" />
                  <Select.Indicator className="[&>svg]:w-3.5 [&>svg]:h-3.5 text-[var(--foreground-muted)] shrink-0" />
                </Select.Trigger>
                <Select.Popover className="w-56 p-1.5 bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto">
                  <ListBox>
                    <ListBox.Item
                      id="all"
                      textValue="All Categories"
                      className="text-xs font-medium px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary text-[var(--foreground)] cursor-pointer flex items-center justify-between"
                    >
                      All Categories
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    {categories.map((category) => (
                      <ListBox.Item
                        key={category}
                        id={category}
                        textValue={category}
                        className="text-xs font-medium px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary text-[var(--foreground)] cursor-pointer flex items-center justify-between"
                      >
                        {category}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            {/* Sort Dropdown */}
            <div className="order-2 grow-0 basis-[calc(50%-4px)] sm:flex-initial min-w-[130px] sm:min-w-[155px]">
              <Select
                aria-label="Sort Vendors"
                selectedKey={currentSort}
                onSelectionChange={(key) => updateParams({ sort: String(key || ""), page: null })}
              >
                <Select.Trigger className="h-10 sm:h-11 w-full px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-between gap-1.5 cursor-pointer hover:border-primary transition-colors shadow-xs [&>span]:text-xs [&>span]:font-semibold">
                  <Select.Value className="text-xs font-semibold truncate" />
                  <Select.Indicator className="[&>svg]:w-3.5 [&>svg]:h-3.5 text-[var(--foreground-muted)] shrink-0" />
                </Select.Trigger>
                <Select.Popover className="w-52 p-1.5 bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl shadow-xl z-50">
                  <ListBox>
                    {SORTS.map((option) => (
                      <ListBox.Item
                        key={option.key}
                        id={option.key}
                        textValue={option.label}
                        className="text-xs font-medium px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary text-[var(--foreground)] cursor-pointer flex items-center justify-between"
                      >
                        {option.label}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            {/* Featured only */}
            <button
              type="button"
              onClick={() => updateParams({ featured: currentFeatured ? null : "true", page: null })}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-semibold border transition-colors cursor-pointer ${
                currentFeatured
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-300/60 dark:border-amber-600/50"
                  : "bg-[var(--surface-elevated)] text-[var(--foreground-muted)] border-[var(--border-color)] hover:text-[var(--foreground)]"
              }`}
            >
              <Crown className="w-3 h-3" />
              Featured only
            </button>
          </div>
        </div>
      </div>

      {/* ── Empty state ── */}
      {vendors.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-10 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-[var(--surface-alt)] flex items-center justify-center">
            <TriangleAlert className="w-5 h-5 text-[var(--foreground-muted)]" />
          </div>
          <h2 className="text-sm font-bold text-[var(--foreground)]">No vendor answers this</h2>
          <p className="text-xs text-[var(--foreground-muted)] max-w-sm mx-auto">
            Nobody is trading under these filters. A shop that is hidden, suspended or closed is
            not listed here — and a typo in a saved link looks exactly the same.
          </p>
          <button
            type="button"
            onClick={() => router.push("/vendors", { scroll: false })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-gradient text-[var(--on-grad-text)] text-[11px] font-bold cursor-pointer"
          >
            Clear the filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* ── Top Toolbar: Feed Info + Mode Toggle Switch ── */}
          <div className="w-full flex items-center justify-between gap-2 sm:gap-4 p-2 sm:p-2.5 sm:px-4 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border-color)] shadow-xs">
            {/* Left: vendor count & live feed status */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              {mode === "pagination" ? (
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[var(--foreground-muted)] truncate">
                  <span className="truncate">
                    Showing{" "}
                    <span className="font-bold text-[var(--foreground)]">
                      {startItem}–{endItem}
                    </span>{" "}
                    of <span className="font-bold text-primary">{total}</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--foreground-muted)] shrink-0">
                    Page {page}/{totalPages}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] truncate">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="truncate">
                      Loaded{" "}
                      <span className="font-bold text-[var(--foreground)]">
                        {displayedVendors.length}
                      </span>{" "}
                      of <span className="font-bold text-primary">{total}</span> shops
                    </span>
                  </span>

                  {/* Progress bar: Always visible in Infinite Scroll mode */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-12 sm:w-20 h-2 rounded-full bg-[var(--surface-alt)] overflow-hidden border border-[var(--border-color)] shadow-2xs">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-500 to-emerald-400 transition-all duration-300 min-w-[4px]"
                        style={{ width: `${Math.max(4, progressPercent)}%` }}
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs font-extrabold text-primary tabular-nums">
                      {progressPercent}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Browse Mode Toggle Segmented Control */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-[var(--foreground-muted)] hidden lg:inline">
                Browse Mode:
              </span>
              <div className="inline-flex items-center p-0.5 sm:p-1 rounded-xl bg-[var(--surface-alt)] border border-[var(--border-color)] shadow-xs">
                <button
                  type="button"
                  onClick={() => handleModeChange("pagination")}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer touch-manipulation whitespace-nowrap ${
                    mode === "pagination"
                      ? "bg-primary text-white shadow-xs"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  }`}
                  title="Show numbered pages navigation"
                >
                  <FileDigit className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Pagination</span>
                  <span className="sm:hidden">Pages</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange("scroll")}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer touch-manipulation whitespace-nowrap ${
                    mode === "scroll"
                      ? "bg-primary text-white shadow-xs"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  }`}
                  title="Continuously load shops while scrolling"
                >
                  <InfinityIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Infinite Scroll</span>
                  <span className="sm:hidden">Scroll</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Vendor grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mode === "pagination" && isPending
              ? Array.from({ length: limit }).map((_, idx) => (
                  <VendorCardSkeleton key={`skel-${idx}`} />
                ))
              : displayedVendors.map((vendor) => (
                  <VendorCard key={vendor._id} vendor={vendor} />
                ))}
          </div>

          {/* ══════════════════════════════════════════════════════════
              MODE A: PAGINATION CONTROLS
          ══════════════════════════════════════════════════════════ */}
          {mode === "pagination" && totalPages > 1 && (
            <div className="flex justify-center pt-2 pb-6">
              <Pagination className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-[var(--foreground-muted)]">
                <Pagination.Summary className="text-xs">
                  Showing{" "}
                  <span className="text-[var(--foreground)] font-bold">
                    {startItem}–{endItem}
                  </span>{" "}
                  of <span className="text-primary font-bold">{total}</span> vendors
                </Pagination.Summary>

                <Pagination.Content className="flex items-center gap-1">
                  {/* Previous button */}
                  <Pagination.Item>
                    <Pagination.Previous
                      className="flex items-center gap-1 px-3 h-8 rounded-lg text-xs hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      isDisabled={page === 1 || isPending}
                      onPress={() => goToPage(page - 1)}
                    >
                      <Pagination.PreviousIcon />
                      <span>Prev</span>
                    </Pagination.Previous>
                  </Pagination.Item>

                  {/* Page number links */}
                  {getPageNumbers().map((p, i) =>
                    p === "ellipsis" ? (
                      <Pagination.Item key={`ellipsis-${i}`}>
                        <Pagination.Ellipsis className="px-2 text-[var(--foreground-muted)] select-none text-xs" />
                      </Pagination.Item>
                    ) : (
                      <Pagination.Item key={p}>
                        <Pagination.Link
                          isActive={p === page}
                          isDisabled={isPending}
                          onPress={() => goToPage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            p === page
                              ? "bg-primary text-white shadow-sm shadow-primary/30"
                              : "hover:bg-primary/10 hover:text-primary text-[var(--foreground-muted)]"
                          }`}
                        >
                          {p}
                        </Pagination.Link>
                      </Pagination.Item>
                    )
                  )}

                  {/* Next button */}
                  <Pagination.Item>
                    <Pagination.Next
                      className="flex items-center gap-1 px-3 h-8 rounded-lg text-xs hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      isDisabled={page === totalPages || isPending}
                      onPress={() => goToPage(page + 1)}
                    >
                      <span>Next</span>
                      <Pagination.NextIcon />
                    </Pagination.Next>
                  </Pagination.Item>
                </Pagination.Content>
              </Pagination>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              MODE B: INFINITE SCROLL LOADER & END-OF-FEED
          ══════════════════════════════════════════════════════════ */}
          {mode === "scroll" && (
            <div className="pt-2 pb-8">
              {/* Skeletons while fetching next batch */}
              {isLoadingMore && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-4">
                    {Array.from({ length: Math.min(4, limit || 4) }).map((_, idx) => (
                      <VendorCardSkeleton key={`scroll-skel-${idx}`} />
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-2 py-3 text-xs font-bold text-[var(--foreground-muted)]">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Loading more vendors...</span>
                  </div>
                </div>
              )}

              {/* Observer Sentinel Element */}
              {hasMore && !isLoadingMore && (
                <div
                  ref={sentinelRef}
                  className="w-full py-4 flex flex-col items-center justify-center text-center"
                >
                  <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)] font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <span>Scroll down to load more vendors...</span>
                  </div>
                  {/* Optional Manual Fallback Button */}
                  <button
                    type="button"
                    onClick={loadMore}
                    className="mt-3 px-4 py-1.5 rounded-xl text-xs font-bold bg-[var(--surface-elevated)] hover:bg-[var(--surface-alt)] text-[var(--foreground)] border border-[var(--border-color)] transition-all cursor-pointer shadow-xs"
                  >
                    Load Next Page
                  </button>
                </div>
              )}

              {/* End of Feed Card */}
              {!hasMore && displayedVendors.length > 0 && (
                <div className="flex flex-col items-center justify-center py-10 px-4 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border-color)] text-center shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[var(--foreground)]">
                    You&apos;ve viewed all {total} vendors
                  </h4>
                  <p className="text-xs text-[var(--foreground-muted)] max-w-sm mt-1">
                    You have reached the end of the directory for the current filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white transition-all cursor-pointer shadow-sm shadow-primary/20 hover:scale-105"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    Back to top
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
