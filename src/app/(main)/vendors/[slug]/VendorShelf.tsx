"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PackageSearch,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import AppSelect from "@/components/shared/AppSelect";
import ProductCard from "@/components/shared/ProductCard";
import type { Product } from "@/types";

interface VendorShelfProps {
  storeSlug: string;
  /** The page's rows, already narrowed and ordered by the query in the URL. */
  initialProducts: Product[];
  initialPagination: { page: number; limit: number; total: number; totalPages: number };
  initialFilters: { search: string; sort: string; filter: string };
}

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "featured", label: "Featured" },
  { value: "rating", label: "Best rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

/** Each filter is one token; the page turns it into the API question it names. */
const FILTERS = [
  { value: "all", label: "All products" },
  { value: "in_stock", label: "In stock" },
  { value: "offer", label: "On offer" },
  { value: "top_rated", label: "Top rated" },
];

/**
 * One vendor's shelf.
 *
 * The page is `/vendors/<slug>`, so the shelf's whole state — the search, the
 * filter, the sort and the page — lives in that URL's query string. Every
 * control writes the query and the server reads it back, which means the rows
 * on screen are always the rows the address names: no second copy of the list
 * to fall out of step, and a narrowed shelf is a link a shopper can share.
 *
 * `storeSlug` is pinned by the server-rendered page, so a shopper cannot type a
 * second vendor's slug into this box — the box never sends one.
 */
export default function VendorShelf({
  storeSlug,
  initialProducts,
  initialPagination,
  initialFilters,
}: VendorShelfProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState(initialFilters.search);
  const [settled, setSettled] = useState(initialFilters.search);

  // The field follows the query the server rendered, so a back button, a reset
  // or a shared link rewrites the box as well as the rows.
  if (initialFilters.search !== settled) {
    setSettled(initialFilters.search);
    setDraft(initialFilters.search);
  }

  // Typing is debounced; leaving the page before the timer fires must not
  // navigate the next one.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  /**
   * Writes the shelf's query and lets the server answer it.
   *
   * A value left out of `next` keeps what the page currently shows, so the
   * pickers never disturb the search and paging never disturbs either.
   */
  const go = (next: { q?: string; sort?: string; filter?: string; page?: number }) => {
    // An explicit control wins over a search still waiting on its timer, so a
    // picker used right after typing keeps its choice instead of being
    // overwritten by the debounce's older closure.
    if (timer.current) clearTimeout(timer.current);

    const q = next.q !== undefined ? next.q : draft;
    const sort = next.sort !== undefined ? next.sort : initialFilters.sort;
    const filter = next.filter !== undefined ? next.filter : initialFilters.filter;
    const page = next.page !== undefined ? next.page : initialPagination.page;

    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (filter) params.set("filter", filter);
    if (sort) params.set("sort", sort);
    if (page > 1) params.set("page", String(page));

    const qs = params.toString();
    startTransition(() => {
      router.replace(`/vendors/${storeSlug}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  };

  const changeSearch = (value: string) => {
    setDraft(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => go({ q: value, page: 1 }), 350);
  };

  /** Any narrowing at all — a word, a filter, a sort or a later page. */
  const canReset = Boolean(
    initialFilters.search || initialFilters.filter || initialFilters.sort || initialPagination.page > 1
  );

  const reset = () => {
    setDraft("");
    go({ q: "", sort: "", filter: "", page: 1 });
  };

  const { page, total, totalPages } = initialPagination;
  const narrowed = Boolean(initialFilters.search || initialFilters.filter);

  return (
    <div className="space-y-4">
      {/* ── Search, filter, sort, reset ── */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-3 sm:p-4 shadow-2xs">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--foreground-muted)]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={draft}
              onChange={(e) => changeSearch(e.target.value)}
              placeholder="Search this vendor's shelf..."
              aria-label="Search this vendor's shelf"
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] transition-all placeholder:text-[var(--foreground-muted)] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AppSelect
              ariaLabel="Filter this shelf"
              size="sm"
              icon={<SlidersHorizontal />}
              className="w-36 sm:w-40"
              value={initialFilters.filter || "all"}
              onChange={(value) => go({ filter: value === "all" ? "" : value, page: 1 })}
              options={FILTERS}
            />
            <AppSelect
              ariaLabel="Sort this shelf"
              size="sm"
              icon={<ArrowUpDown />}
              className="w-40 sm:w-44"
              value={initialFilters.sort || "newest"}
              onChange={(value) => go({ sort: value === "newest" ? "" : value, page: 1 })}
              options={SORTS}
            />
            {canReset && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-[var(--surface-alt)] px-3 text-[11px] font-semibold text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)] cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)]">
        <span>
          {total} {total === 1 ? "listing" : "listings"} in this shop
        </span>
        {isPending && (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Refreshing
          </span>
        )}
      </div>

      {/* ── Grid ── */}
      {initialProducts.length === 0 && !isPending ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-10 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-[var(--surface-alt)] flex items-center justify-center">
            <PackageSearch className="w-5 h-5 text-[var(--foreground-muted)]" />
          </div>
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            {narrowed ? "Nothing here matches that" : "This vendor has nothing on the shelf yet"}
          </h3>
          <p className="text-xs text-[var(--foreground-muted)] max-w-sm mx-auto">
            {narrowed
              ? "Try a shorter word or another filter, or reset the shelf to see everything the shop sells."
              : "The shop is trading, but it has no published listings right now. Check back soon."}
          </p>
          {narrowed && (
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 rounded-xl bg-brand-gradient text-[var(--on-grad-text)] text-[11px] font-bold cursor-pointer"
            >
              Reset the shelf
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {initialProducts.map((product, index) => (
            <ProductCard
              key={product.id || product._id || index}
              product={product}
              hasRightBorder={false}
            />
          ))}
        </div>
      )}

      {/* ── Paging ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-[var(--foreground-muted)]">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || isPending}
              onClick={() => go({ page: Math.max(1, page - 1) })}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-alt)] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-3 w-3" />
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || isPending}
              onClick={() => go({ page: page + 1 })}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-alt)] disabled:opacity-40 cursor-pointer"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
