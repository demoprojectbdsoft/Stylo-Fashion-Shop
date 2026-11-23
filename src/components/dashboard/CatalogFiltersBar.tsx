"use client";

import React, { useState } from "react";
import { Button, Input } from "@heroui/react";
import { ArrowUpDown, Layers, Package, RotateCcw, Search } from "lucide-react";
import AppSelect from "@/components/shared/AppSelect";

/**
 * The browsing bar the two product desks share.
 *
 * A strip of status tabs with their counts, the stock question folded into the
 * same strip, then a row holding the search field and the category, subcategory
 * and sort pickers. It is presentational on purpose: every control reports its
 * choice through a callback and holds no filter state, so the admin desk can
 * keep its filters in the URL and the seller's desk in its own route. The
 * search draft is the one local value — a field that pushed a request per
 * keystroke would make the list jump while someone is still typing.
 *
 * Layout: on a phone the search keeps a line of its own, the category shares
 * the next one with the sort, and when the chosen category offers
 * subcategories the two pickers fill that line with the sort dropping below.
 */

export interface CatalogFilterOption {
  id: string;
  label: string;
}

interface PickerProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

interface CatalogFiltersBarProps {
  /** Status buckets as tabs; "all" is expected as the first id. */
  statusOptions: CatalogFilterOption[];
  statusCounts: Record<string, number>;
  status: string;
  onStatusChange: (id: string) => void;
  /** The figure on the right of the strip. */
  total: number;
  totalLabel?: string;

  /** The stock toggle; omit it on a list that cannot tell stock apart. */
  stock?: {
    /** One of "all", "in", "out"; each desk maps that to its own URL token. */
    value: string;
    onChange: (value: "all" | "in" | "out") => void;
  };

  search: {
    value: string;
    onSubmit: (value: string) => void;
    placeholder?: string;
  };

  category?: PickerProps;
  /** Only pass this once the chosen category actually has subcategories. */
  subCategory?: PickerProps;
  sort?: PickerProps;

  onReset?: () => void;
  /** Whether anything sits off its default, which is what shows Reset. */
  canReset: boolean;
}

export default function CatalogFiltersBar({
  statusOptions,
  statusCounts,
  status,
  onStatusChange,
  total,
  totalLabel = "Total products",
  stock,
  search,
  category,
  subCategory,
  sort,
  onReset,
  canReset,
}: CatalogFiltersBarProps) {
  // The field's own draft, kept in step with the value the server rendered:
  // when the settled filter changes (a reset, or a search from elsewhere) the
  // draft follows it during the render rather than one pass later.
  const [draft, setDraft] = useState(search.value);
  const [settled, setSettled] = useState(search.value);

  if (search.value !== settled) {
    setSettled(search.value);
    setDraft(search.value);
  }

  const submitSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    search.onSubmit(draft.trim());
  };

  const hasSubCategory = Boolean(subCategory);

  return (
    <div className="space-y-3 bg-[var(--surface-elevated)] p-4 rounded-2xl border border-[var(--border-color)] shadow-xs">
      {/* Status tabs, then the stock question in the same strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {statusOptions.map((tab) => {
            const active = status === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? "bg-primary text-white shadow-xs"
                    : "text-[var(--foreground-secondary)] dark:text-[var(--foreground-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded px-1 text-[10px] font-bold ${
                    active ? "bg-white/20" : "bg-[var(--surface-alt)]"
                  }`}
                >
                  {statusCounts[tab.id] ?? 0}
                </span>
              </button>
            );
          })}

          {stock && (
            <>
              {/* A hairline keeps the two questions apart instead of boxing
                  the second one off */}
              <span
                aria-hidden
                className="mx-1.5 h-5 w-px shrink-0 bg-[var(--border-color)]"
              />

              {(
                [
                  { id: "in", label: "In stock" },
                  { id: "out", label: "Out of stock" },
                ] as const
              ).map((st) => {
                const active = stock.value === st.id;
                // No "All stock" pill: the strip opens on every row, so
                // pressing the live chip a second time clears it.
                return (
                  <button
                    key={st.id}
                    type="button"
                    aria-pressed={active}
                    title={active ? "Show every listing again" : undefined}
                    onClick={() => stock.onChange(active ? "all" : st.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? "bg-primary text-white shadow-xs"
                        : "text-[var(--foreground-secondary)] dark:text-[var(--foreground-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </>
          )}
        </div>

        <div className="text-xs font-semibold text-[var(--foreground-muted)] shrink-0">
          {totalLabel}: <span className="font-extrabold text-[var(--foreground)]">{total}</span>
        </div>
      </div>

      {/* Search, category and sort */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3 pt-3 border-t border-[var(--border-color)]">
        <form
          onSubmit={submitSearch}
          className="relative flex w-full max-w-md min-w-0 items-center gap-2 xl:w-auto xl:flex-1"
        >
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] z-10" />
            <Input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={search.placeholder || "Search…"}
              aria-label="Search this list"
              className="w-full pl-9 pr-4 h-9 bg-[var(--surface-alt)] dark:bg-[var(--surface)] border border-[var(--border-color)] rounded-xl text-xs"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs cursor-pointer shrink-0"
          >
            Search
          </Button>
        </form>

        {/* A little air after the search once they share the row */}
        {category && (
          <div
            className={
              hasSubCategory
                ? "w-[calc(50%-0.25rem)] shrink-0 xl:ml-4 xl:w-40"
                : "min-w-0 flex-1 sm:flex-none sm:w-40 xl:ml-4"
            }
          >
            <AppSelect
              ariaLabel="Filter by category"
              size="sm"
              icon={<Layers />}
              className="w-full"
              value={category.value}
              onChange={category.onChange}
              options={category.options}
            />
          </div>
        )}

        {subCategory && (
          <div className="w-[calc(50%-0.25rem)] shrink-0 xl:w-40">
            <AppSelect
              ariaLabel="Filter by subcategory"
              size="sm"
              icon={<Package />}
              className="w-full"
              value={subCategory.value}
              onChange={subCategory.onChange}
              options={subCategory.options}
            />
          </div>
        )}

        {(sort || (canReset && onReset)) && (
          <div
            className={`flex items-center gap-2 ${
              hasSubCategory ? "w-full xl:ml-auto xl:w-auto" : "shrink-0 xl:ml-auto"
            }`}
          >
            {sort && (
              <div
                className={
                  hasSubCategory
                    ? "min-w-0 flex-1 xl:w-48 xl:flex-none"
                    : "w-40 sm:w-44 xl:w-48"
                }
              >
                <AppSelect
                  ariaLabel="Sort this list"
                  size="sm"
                  icon={<ArrowUpDown />}
                  className="w-full"
                  value={sort.value}
                  onChange={sort.onChange}
                  options={sort.options}
                />
              </div>
            )}

            {canReset && onReset && (
              <Button
                size="sm"
                onPress={onReset}
                className="h-9 px-3 rounded-xl bg-[var(--surface-alt)] text-[var(--foreground-secondary)] dark:text-[var(--foreground-muted)] hover:text-[var(--foreground)] dark:hover:text-[var(--foreground)] text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
