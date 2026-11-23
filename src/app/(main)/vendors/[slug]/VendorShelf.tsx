"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, PackageSearch, Search } from "lucide-react";
import ProductCard from "@/components/shared/ProductCard";
import type { Product } from "@/types";

interface VendorShelfProps {
  storeSlug: string;
  /** The page's rows, already narrowed and ordered by the query in the URL. */
  initialProducts: Product[];
  initialPagination: { page: number; limit: number; total: number; totalPages: number };
  initialFilters: { search: string; sort: string };
}

const SORTS = [
  { key: "", label: "Newest" },
  { key: "featured", label: "Featured" },
  { key: "rating", label: "Best rated" },
  { key: "price_asc", label: "Price: low to high" },
  { key: "price_desc", label: "Price: high to low" },
];

/**
 * One vendor's shelf.
 *
 * The page is `/vendors/<slug>`, so the shelf's whole state — the search, the
 * sort and the page — lives in that URL's query string. Every control writes
 * the query and the server reads it back, which means the rows on screen are
 * always the rows the address names: no second copy of the list to fall out of
 * step, and a filtered shelf is a link a shopper can share.
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

  // The field follows the query the server rendered, so a back button or a
  // shared link rewrites the box as well as the rows.
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
   * A value left out of `next` keeps what the page currently shows, so the sort
   * chips never disturb the search and paging never disturbs either.
   */
  const go = (next: { q?: string; sort?: string; page?: number }) => {
    // An explicit control wins over a search still waiting on its timer, so a
    // sort clicked right after typing keeps the new sort instead of being
    // overwritten by the debounce's older closure.
    if (timer.current) clearTimeout(timer.current);

    const q = next.q !== undefined ? next.q : draft;
    const sort = next.sort !== undefined ? next.sort : initialFilters.sort;
    const page = next.page !== undefined ? next.page : initialPagination.page;

    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
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

  const clearSearch = () => {
    setDraft("");
    go({ q: "", page: 1 });
  };

  const { page, total, totalPages } = initialPagination;
  const searching = Boolean(initialFilters.search);

  return (
    <div className="space-y-5">
      {/* ── Search, sort ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--foreground-muted)]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={draft}
            onChange={(e) => changeSearch(e.target.value)}
            placeholder="Search this vendor's shelf..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-[var(--foreground-muted)]"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {SORTS.map((option) => (
            <button
              key={option.key || "default"}
              type="button"
              onClick={() => go({ sort: option.key, page: 1 })}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                initialFilters.sort === option.key
                  ? "bg-brand-gradient text-[var(--on-grad-text)] border-transparent"
                  : "bg-[var(--surface-elevated)] text-[var(--foreground-muted)] border-[var(--border-color)] hover:text-[var(--foreground)]"
              }`}
            >
              {option.label}
            </button>
          ))}
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
            {searching ? "Nothing here matches that" : "This vendor has nothing on the shelf yet"}
          </h3>
          <p className="text-xs text-[var(--foreground-muted)] max-w-sm mx-auto">
            {searching
              ? "Try a shorter word, or clear the search to see everything the shop sells."
              : "The shop is trading, but it has no published listings right now. Check back soon."}
          </p>
          {searching && (
            <button
              type="button"
              onClick={clearSearch}
              className="px-4 py-2 rounded-xl bg-brand-gradient text-[var(--on-grad-text)] text-[11px] font-bold cursor-pointer"
            >
              Clear the search
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
