"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Ticket,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import type { Coupon, CouponState } from "@/types";
import type { VendorPagination } from "@/types/vendor";
import { formatPrice } from "@/lib/currency";
import {
  couponDiscountWords,
  couponScopeWords,
  couponUsageWords,
  couponWindowWords,
  getCouponStateStyle,
} from "@/lib/couponWords";
import { deleteStoreCoupon, moderateSellerCoupon, setStoreCouponActive } from "@/lib/action/coupons";
import AdminCouponForm, {
  type CouponCategoryOption,
  type CouponProductOption,
} from "./AdminCouponForm";

// The page reads the pickers, so it needs the shapes the editor is handed.
export type { CouponCategoryOption, CouponProductOption };

/**
 * The store team's coupons board.
 *
 * Every code in the store is on one board — ours and the sellers' — because the
 * checkout reads them all from the same collection. What the board will not do is
 * write a seller's row: the shop owns that code, and renewing it would spend a
 * slot on their plan, not ours.
 */

interface AdminCouponsClientProps {
  coupons: Coupon[];
  typeCounts: Record<string, number>;
  pagination: VendorPagination;
  filters: {
    status: string;
    owner: string;
    search: string;
    /** "" (closed), "new", or the id of the code being edited. */
    edit: string;
    productSearch: string;
  };
  /** The row the `edit` param points at; null when it is a new code or gone. */
  editing: Coupon | null;
  categories: CouponCategoryOption[];
  products: CouponProductOption[];
  currency: string;
}

const STATE_TABS: { key: CouponState | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Running" },
  { key: "upcoming", label: "Scheduled" },
  { key: "expired", label: "Ended" },
  { key: "stopped", label: "Stopped" },
];

const OWNER_TABS: { key: string; label: string }[] = [
  { key: "all", label: "Every code" },
  { key: "admin", label: "The store's own" },
  { key: "vendor", label: "Sellers'" },
];

export default function AdminCouponsClient({
  coupons,
  typeCounts,
  pagination,
  filters,
  editing,
  categories,
  products,
  currency,
}: AdminCouponsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search);
  const [busyId, setBusyId] = useState<string | null>(null);
  // A seller's row is being blocked: the id whose reason box is open, and the
  // reason itself. Ours never uses it — a store code is edited, not blocked.
  const [blockingId, setBlockingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  /**
   * Every filter, the open editor and the picker's search live in the URL, so the
   * board and the products it offers are read on the server and survive a refresh.
   */
  const go = (
    next: Partial<{
      status: string;
      owner: string;
      search: string;
      page: number;
      edit: string;
      productSearch: string;
    }>
  ) => {
    const params = new URLSearchParams();
    const nextStatus = next.status ?? filters.status;
    const nextOwner = next.owner ?? filters.owner;
    const nextSearch = (next.search ?? search).trim();
    const nextEdit = next.edit ?? filters.edit;
    const nextProductSearch = (next.productSearch ?? filters.productSearch).trim();
    const page = next.page ?? 1;

    if (nextOwner && nextOwner !== "all") params.set("owner", nextOwner);
    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    if (nextSearch) params.set("search", nextSearch);
    if (nextEdit) params.set("edit", nextEdit);
    // The picker's term only means anything while an editor is open.
    if (nextEdit && nextProductSearch) params.set("pq", nextProductSearch);
    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    router.push(query ? `/dashboard/admin/coupons?${query}` : "/dashboard/admin/coupons");
  };

  const closeEditor = () => go({ edit: "", productSearch: "" });

  const toggleActive = async (coupon: Coupon) => {
    if (busyId) return;

    setBusyId(coupon._id);
    try {
      const res = await setStoreCouponActive(coupon._id, !coupon.isActive);
      if (res?.success === false) {
        toast.error(res.message || "The code could not be changed");
        return;
      }
      toast.success(coupon.isActive ? "Coupon stopped" : "Coupon running again");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message || "An error occurred");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (coupon: Coupon) => {
    if (busyId) return;

    setBusyId(coupon._id);
    try {
      const res = await deleteStoreCoupon(coupon._id);
      if (res?.success === false) {
        toast.error(res.message || "The code could not be removed");
        return;
      }
      // A spent code is only stopped, and the API says which of the two happened.
      toast.success(res?.message || "Coupon stopped");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message || "An error occurred");
    } finally {
      setBusyId(null);
    }
  };

  /**
   * The one write this desk has over somebody else's row.
   *
   * A seller owns their code, so nothing here edits its price, its window or
   * its reach: the desk can take it off the checkout, put a stopped one back,
   * or remove it. The reason is written onto the row, which is what the
   * seller's own coupons desk reads instead of leaving them to guess.
   */
  const moderate = async (coupon: Coupon, action: "block" | "unblock" | "delete") => {
    if (busyId) return;

    if (
      action === "delete" &&
      !window.confirm(
        `Remove ${coupon.code}? A code that has already saved shoppers money is only blocked, and the orders that used it stay.`
      )
    ) {
      return;
    }

    setBusyId(coupon._id);
    try {
      const res = await moderateSellerCoupon(coupon._id, action, action === "block" ? reason : undefined);
      if (res?.success === false) {
        toast.error(res.message || "The code could not be changed");
        return;
      }
      toast.success(
        res?.message ||
          (action === "unblock" ? "Code is live again" : action === "block" ? "Code blocked" : "Code removed")
      );
      setBlockingId(null);
      setReason("");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message || "An error occurred");
    } finally {
      setBusyId(null);
    }
  };

  // An id that no longer resolves is not a new code, so the editor stays shut
  // and the board says what happened instead of opening an empty form.
  const editorOpen = Boolean(filters.edit) && (filters.edit === "new" || Boolean(editing));
  const missingCode = Boolean(filters.edit) && filters.edit !== "new" && !editing;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[var(--foreground)]">Coupons</h1>
          <p className="text-[11px] text-[var(--foreground-muted)]">
            Codes the store writes reach everything. A seller&rsquo;s code reaches
            only their own shelf, and this desk can block one, put it back or
            remove it — never write it.
          </p>
        </div>

        {!editorOpen && (
          <button
            type="button"
            onClick={() => go({ edit: "new" })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-3 py-2 text-[11px] font-bold text-[var(--on-grad-text)] shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            New store code
          </button>
        )}
      </header>

      {missingCode && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
          That code is not on the board any more — it was deleted, or the owner
          turned out not to be ours to write. Nothing was changed.
        </p>
      )}

      {editorOpen && (
        <AdminCouponForm
          key={filters.edit}
          coupon={editing}
          categories={categories}
          products={products}
          productSearch={filters.productSearch}
          currency={currency}
          onSearchProducts={(term) => go({ productSearch: term, page: 1 })}
          onDone={closeEditor}
        />
      )}

      {/* Filters */}
      <div className="space-y-3 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATE_TABS.map((tab) => {
            const active = filters.status === tab.key;
            const count = tab.key === "all" ? typeCounts.all || 0 : typeCounts[tab.key] || 0;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => go({ status: tab.key, page: 1 })}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                  active
                    ? "bg-brand-gradient text-[var(--on-grad-text)] shadow-xs"
                    : "text-[var(--foreground-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded px-1 text-[9px] font-bold ${active ? "bg-white/20" : "bg-[var(--surface-alt)]"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {OWNER_TABS.map((tab) => {
              const active = filters.owner === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => go({ owner: tab.key, page: 1 })}
                  className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    active
                      ? "bg-[var(--surface-alt)] text-[var(--foreground)]"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              go({ search, page: 1 });
            }}
            className="relative w-full sm:w-64"
          >
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--foreground-muted)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Code or label"
              className="h-9 w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface)] pl-9 pr-3 text-[11px] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--brand-flat)]/35"
            />
          </form>
        </div>
      </div>

      {/* The codes */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] shadow-2xs">
        {coupons.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <Ticket className="h-6 w-6 text-[var(--foreground-muted)]" />
            <p className="text-xs font-semibold text-[var(--foreground)]">No codes here</p>
            <p className="max-w-sm text-[11px] text-[var(--foreground-muted)]">
              {filters.search || filters.status !== "all" || filters.owner !== "all"
                ? "Nothing matches this view."
                : "A code written here is what a shopper types in the cart, and it can cover anything in the store."}
            </p>
            {!editorOpen && (
              <button
                type="button"
                onClick={() => go({ edit: "new" })}
                className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] px-3 py-2 text-[11px] font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-alt)] cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                New store code
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border-color)]">
            {coupons.map((coupon) => {
              const style = getCouponStateStyle(coupon.state);
              const ours = coupon.ownerType === "admin";

              return (
                <li key={coupon._id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="rounded-lg bg-[var(--surface-alt)] px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--foreground)]">
                        {coupon.code}
                      </p>
                      {coupon.title && (
                        <p className="truncate text-[11px] font-semibold text-[var(--foreground-muted)]">
                          {coupon.title}
                        </p>
                      )}
                    </div>
                    <p className="mt-1 truncate text-[10px] text-[var(--foreground-muted)]">
                      {couponDiscountWords(coupon, currency)} ·{" "}
                      {couponScopeWords(coupon, "staff")} · {couponWindowWords(coupon)}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-[var(--foreground-muted)]">
                      {couponUsageWords(coupon)}
                      {coupon.discountGiven > 0 && (
                        <> · {formatPrice(coupon.discountGiven, currency)} given away</>
                      )}
                      {coupon.minOrderAmount > 0 && (
                        <> · min {formatPrice(coupon.minOrderAmount, currency)}</>
                      )}
                    </p>
                    <p className="mt-0.5 truncate text-[10px]">
                      {ours ? (
                        <span className="font-semibold text-[var(--foreground-muted)]">
                          Written here — reaches the whole store
                        </span>
                      ) : (
                        <span className="text-[var(--foreground-muted)]">
                          {coupon.sellerName || "A seller"}
                          {coupon.storeSlug ? ` · /${coupon.storeSlug}` : ""} — their own
                          desk writes this code; this one can stop it
                        </span>
                      )}
                    </p>
                    {!ours && coupon.blockedReason && (
                      <p className="mt-1 inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                        <Ban className="h-3 w-3" />
                        Blocked by this desk: {coupon.blockedReason}
                        {coupon.blockedAt ? ` (${new Date(coupon.blockedAt).toLocaleDateString()})` : ""}
                      </p>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center rounded-lg border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${style.badge}`}
                  >
                    {style.label}
                  </span>

                  {ours ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => go({ edit: coupon._id })}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-2 py-1.5 text-[10px] font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-alt)] cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleActive(coupon)}
                        disabled={busyId === coupon._id}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-2 py-1.5 text-[10px] font-semibold text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)] disabled:opacity-50 cursor-pointer"
                      >
                        {busyId === coupon._id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {coupon.isActive ? "Stop" : "Resume"}
                      </button>

                      <button
                        type="button"
                        onClick={() => remove(coupon)}
                        disabled={busyId === coupon._id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-alt)] hover:text-rose-600 disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {coupon.isActive ? (
                        <button
                          type="button"
                          onClick={() => {
                            setBlockingId(blockingId === coupon._id ? null : coupon._id);
                            setReason("");
                          }}
                          disabled={busyId === coupon._id}
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-2 py-1.5 text-[10px] font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-alt)] disabled:opacity-50 cursor-pointer"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Block
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => moderate(coupon, "unblock")}
                          disabled={busyId === coupon._id}
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-2 py-1.5 text-[10px] font-semibold text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)] disabled:opacity-50 cursor-pointer"
                        >
                          {busyId === coupon._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                          )}
                          Put back
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => moderate(coupon, "delete")}
                        disabled={busyId === coupon._id}
                        title="Remove this code"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-alt)] hover:text-rose-600 disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Why the code is going quiet — the seller reads this on their desk. */}
                  {blockingId === coupon._id && (
                    <div className="flex w-full flex-wrap items-center gap-2 rounded-xl bg-[var(--surface-alt)] px-3 py-2">
                      <input
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        maxLength={200}
                        placeholder="Why is this code coming off? The seller will read this."
                        className="h-8 min-w-0 flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-2 text-[11px] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--brand-flat)]/35"
                      />
                      <button
                        type="button"
                        onClick={() => moderate(coupon, "block")}
                        disabled={busyId === coupon._id}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                      >
                        {busyId === coupon._id && <Loader2 className="h-3 w-3 animate-spin" />}
                        Block code
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBlockingId(null);
                          setReason("");
                        }}
                        className="rounded-lg border border-[var(--border-color)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] px-4 py-2.5 shadow-2xs">
          <p className="text-[10px] text-[var(--foreground-muted)]">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} codes
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go({ page: pagination.page - 1 })}
              disabled={pagination.page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-alt)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-3 w-3" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => go({ page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-alt)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
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
