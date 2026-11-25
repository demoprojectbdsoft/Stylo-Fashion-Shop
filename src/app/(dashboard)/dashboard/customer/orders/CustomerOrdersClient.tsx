"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  Button,
  Input,
  Select,
  ListBox,
} from "@heroui/react";
import {
  ShoppingBag,
  Package,
  Bike,
  Truck,
  Navigation,
  Phone,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Search,
  Download,
  RotateCcw,
  RefreshCw,
  Star,
  Copy,
  XCircle,
  PackageCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import SuspendedAccountModal from "@/components/shared/SuspendedAccountModal";
import { CustomerOrder, CustomerOrderItem } from "@/types/customerDashboard";
import { addToCart } from "@/lib/action/cart";
import { cancelMyOrder } from "@/lib/action/orders";
import { downloadOrderInvoicePdf } from "@/lib/orderInvoicePdf";
import OrderStatusBadge from "@/components/shared/OrderStatusBadge";
import { formatOrderDateTime } from "@/lib/dateTime";
import { isProductOutOfStock } from "@/lib/stock";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { fetchTrackingAction } from "@/lib/action/deliveries";
import UserAvatar from "@/components/shared/UserAvatar";
import type { DeliveryTracking } from "@/types/delivery";
import {
  DELIVERY_STAGE_LABELS,
  DELIVERY_STATUS_NEUTRAL_LABELS,
  DELIVERY_STATUS_STYLES,
  formatEta,
  formatMoment,
} from "@/lib/rider";

/** Options for the status filter, in the order a shopper expects to see them. */
const STATUS_OPTIONS = ["All Orders", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

/** Orders shown at once. The cards are tall, so a short page reads better. */
const ORDERS_PER_PAGE = 5;

/** How the list can be ordered. */
const SORT_OPTIONS = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "highest", label: "Total: high to low" },
  { key: "lowest", label: "Total: low to high" },
];

/** Human-readable label for the shipping option stored on an order.
 *  Pre-existing orders have no method stored — assume Standard Delivery. */
function shippingMethodLabel(method?: CustomerOrder["shippingMethod"]): string {
  switch (method) {
    case "free":    return "Free Shipping";
    case "express": return "Express Delivery";
    case "standard":return "Standard Delivery";
    default:        return "Standard Delivery";
  }
}

// ── Order helpers ────────────────────────────────────────────────────────────

/** Milliseconds since the epoch, used to order the cards; a bad date sorts last. */
function orderTimestamp(order: CustomerOrder): number {
  const time = new Date(order.createdAt || order.date).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/**
 * The Review button is revealed by this rule: only a delivered order can be
 * reviewed, so it carries the one check every delivered-only action shares.
 */
function isDeliveredOrder(order: CustomerOrder): boolean {
  return order.status === "Delivered";
}

/**
 * A customer may call off an order only while it is still being packed — before
 * it ships and before a rider holds it. The API re-checks both.
 */
function canCancelOrder(order: CustomerOrder): boolean {
  const raw = (order.rawStatus || "").toLowerCase();
  const status = raw || order.status.toLowerCase();
  return status === "confirmed" || status === "processing";
}

interface CustomerOrdersClientProps {
  initialOrders: CustomerOrder[];
  /** Pre-fills the search box, so a notification link can land on the exact order. */
  initialSearch?: string;
}

export default function CustomerOrdersClient({ initialOrders = [], initialSearch = "" }: CustomerOrdersClientProps) {
  const { formatPrice, settings: siteSettings } = useSiteSettings();
  const siteName = siteSettings.siteName || "Sparq";
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isSuspended = ((user as { status?: string })?.status || "").toLowerCase() === "suspended";
  const [showSuspendedAlert, setShowSuspendedAlert] = useState(false);

  const [orders, setOrders] = useState<CustomerOrder[]>(
    Array.isArray(initialOrders) ? initialOrders : []
  );
  const [selectedTab, setSelectedTab] = useState("All Orders");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  // The toolbar keeps the status select and the sort select on one row.
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [trackingModalOrder, setTrackingModalOrder] = useState<CustomerOrder | null>(null);

  // Live delivery data behind the Track Shipment modal: rider, stage, ETA and
  // the rider-driven statuses. Fetched on open and on demand (Refresh), so the
  // token stays on the server and the page is never blocked on it.
  const [tracking, setTracking] = useState<DeliveryTracking | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // ── Cancel order modal: only while the order is still being packed ─────────
  const [cancelTarget, setCancelTarget] = useState<CustomerOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // ── Track Shipment modal: live delivery ────────────────────────────────────
  // Fetches the delivery behind an order when the modal opens, so the rider and
  // every rider-driven stage (assigned → accepted → picked up → out for
  // delivery → delivered) show up alongside the order's own timeline. A failed
  // read simply leaves the modal on the order timeline, never blocking it.
  const openTrackingModal = (order: CustomerOrder) => {
    // Clear the previous order's live data first, so a different order never
    // flashes the last order's rider while the next read is in flight.
    setTracking(null);
    setTrackingLoading(true);
    setTrackingModalOrder(order);
  };

  useEffect(() => {
    if (!trackingModalOrder) return;
    let cancelled = false;
    fetchTrackingAction(trackingModalOrder.id)
      .then((res) => {
        if (!cancelled) setTracking(res);
      })
      .catch(() => {
        if (!cancelled) setTracking(null);
      })
      .finally(() => {
        if (!cancelled) setTrackingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [trackingModalOrder]);

  const isDeliveryLive = tracking?.delivery
    ? !["delivered", "cancelled", "declined"].includes(tracking.delivery.status)
    : false;

  // The finer statuses the rider drives, in order. Mirrors the tracking page's
  // own step list so the modal and the live page tell the same story.
  const deliverySteps = useMemo(() => {
    const d = tracking?.delivery;
    if (!d) return [];
    return [
      { key: "assigned", label: DELIVERY_STAGE_LABELS.assigned, at: d.createdAt },
      { key: "accepted", label: DELIVERY_STAGE_LABELS.accepted, at: d.acceptedAt },
      { key: "picked_up", label: DELIVERY_STAGE_LABELS.picked_up, at: d.pickedUpAt },
      {
        key: "out_for_delivery",
        label: DELIVERY_STAGE_LABELS.out_for_delivery,
        at: d.outForDeliveryAt,
      },
      { key: "delivered", label: DELIVERY_STAGE_LABELS.delivered, at: d.deliveredAt },
    ];
  }, [tracking]);

  const refreshTracking = async () => {
    if (!trackingModalOrder) return;
    setTrackingLoading(true);
    try {
      const res = await fetchTrackingAction(trackingModalOrder.id);
      setTracking(res);
    } finally {
      setTrackingLoading(false);
    }
  };

  const query = searchQuery.trim().toLowerCase();

  // Filter first, then order, then cut the page, so the count shown in the
  // footer always describes what is actually visible.
  const filteredOrders = orders
    .filter((order) => {
      const matchesTab =
        selectedTab === "All Orders" ||
        order.status.toLowerCase() === selectedTab.toLowerCase();
      const matchesSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        // A notification deep-links with the order's id, not its short number.
        order.id.toLowerCase().includes(query) ||
        order.items.some((item) => item.name.toLowerCase().includes(query));
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return orderTimestamp(a) - orderTimestamp(b);
        case "highest":
          return b.total - a.total;
        case "lowest":
          return a.total - b.total;
        default:
          return orderTimestamp(b) - orderTimestamp(a);
      }
    });

  // The page is clamped rather than reset in an effect, so a filter that shrinks
  // the list drops the shopper onto the last page instead of an empty one.
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * ORDERS_PER_PAGE;
  const visibleOrders = filteredOrders.slice(pageStart, pageStart + ORDERS_PER_PAGE);

  // Every filter change goes back to page one, so a narrowed list is never
  // hidden on a page the shopper happened to be sitting on.
  const goToPage = (next: number) => {
    setPage(next);
    // The cards are tall, so a new page starts from the toolbar again.
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const userRole = ((user as { role?: string })?.role || "").toLowerCase();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  // Id of the order whose invoice is being generated right now.
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);

  const handleDownloadInvoice = async (order: CustomerOrder) => {
    setDownloadingOrderId(order.id);
    try {
      await downloadOrderInvoicePdf(order, {
        siteName,
        formatMoney: formatPrice,
      });
      toast.success(`Invoice ${order.orderNumber} downloaded.`);
    } catch {
      toast.error("Could not create the invoice PDF. Please try again.");
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const handleBuyAgain = async (item: CustomerOrderItem) => {
    if (isSuspended) {
      setShowSuspendedAlert(true);
      return;
    }

    if (userRole === "admin" || userRole === "demoadmin") {
      toast.warning(
        userRole === "demoadmin"
          ? "Demo admin cannot add products to cart!"
          : "Admin cannot add products to cart!"
      );
      return;
    }

    // A product with no stock count is not tracked, so Buy Again is always allowed.
    if (isProductOutOfStock(item)) {
      toast.warning(`"${item.name}" is currently out of stock!`, {
        icon: <span>⚠️</span>,
      });
      return;
    }

    const productId = item.productId || item.id;
    if (!productId) {
      toast.error("Product information unavailable to reorder.");
      return;
    }

    try {
      setLoadingItemId(item.id);
      const res = await addToCart(productId, 1);
      if (res?.success) {
        toast.success(`"${item.name}" added to cart!`, {
          icon: <span>🛒</span>,
        });
        window.dispatchEvent(new CustomEvent("cart-updated"));
      } else {
        const errorMsg = res?.message || "Failed to add to cart";
        if (
          errorMsg.toLowerCase().includes("out of stock") ||
          errorMsg.toLowerCase().includes("stock")
        ) {
          toast.warning(errorMsg, {
            icon: <span>⚠️</span>,
          });
        } else {
          toast.error(errorMsg);
        }
      }
    } catch {
      toast.error("Failed to add product to cart");
    } finally {
      setLoadingItemId(null);
    }
  };

  const copyTracking = (tracking: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tracking);
      toast.info(`Tracking #${tracking} copied to clipboard!`);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      const res = await cancelMyOrder(cancelTarget.id, cancelReason.trim());
      if (res?.success === false) {
        toast.error(res?.message || "Could not cancel the order");
        return;
      }
      toast.success("Order cancelled");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancelTarget.id
            ? { ...o, status: "Cancelled" as const, rawStatus: "cancelled" }
            : o
        )
      );
      setCancelTarget(null);
      setCancelReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel the order");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
    <SuspendedAccountModal
      isOpen={showSuspendedAlert}
      onOpenChange={setShowSuspendedAlert}
      message="Your account has been suspended. You are not allowed to add items to the cart or reorder. Please contact support for assistance."
    />

    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground-muted)] mb-1">
            <Link href="/dashboard/customer" className="hover:text-primary transition-colors">
              Customer Dashboard
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">My Orders</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
            Order History &amp;{" "}
            <span className="text-gradient-primary">
              Tracking
            </span>
          </h1>
          <p className="text-xs md:text-sm text-[var(--foreground-muted)] mt-1">
            Track active shipments, manage past deliveries, and download receipts.
          </p>
        </div>

        <Link
          href="/shop"
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer self-start sm:self-auto h-10 px-4 rounded-xl flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Shop More Items</span>
        </Link>
      </div>

      {/* ── Search, Filters & Sort ── */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] z-10" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by order number (e.g. #ORD-9582) or product title..."
            className="w-full pl-9 pr-4 h-10 bg-[var(--surface-alt)] border border-[var(--border-color)] focus:border-primary rounded-xl text-xs transition-all text-[var(--foreground)] shadow-xs"
          />
        </div>

        {/* Status and sort share one row instead of a long strip */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-40">
            <Select
              aria-label="Filter orders by status"
              selectedKey={selectedTab}
              onSelectionChange={(key) => {
                setSelectedTab(String(key ?? "All Orders"));
                setPage(1);
              }}
            >
              <Select.Trigger className="h-10 w-full px-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-between gap-1.5 cursor-pointer hover:border-primary transition-colors shadow-xs [&>span]:text-xs [&>span]:font-semibold">
                {/* Only the tab's name goes in the trigger. The dropdown rows also
                    carry a count badge, and without this render prop that badge
                    was printed under the label inside the closed select. */}
                <Select.Value className="text-xs font-semibold truncate">
                  {({ selectedText }) => (
                    <span className="truncate">{selectedText}</span>
                  )}
                </Select.Value>
                <Select.Indicator className="[&>svg]:w-3.5 [&>svg]:h-3.5 text-[var(--foreground-muted)] shrink-0" />
              </Select.Trigger>
              <Select.Popover className="w-56 p-1.5 bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl shadow-xl z-50">
                <ListBox>
                  {STATUS_OPTIONS.map((tab) => {
                    // Each option carries its own count, so the old pill badges
                    // are still readable inside the dropdown.
                    const count =
                      tab === "All Orders"
                        ? orders.length
                        : orders.filter((o) => o.status.toLowerCase() === tab.toLowerCase()).length;

                    return (
                      <ListBox.Item
                        key={tab}
                        id={tab}
                        textValue={tab}
                        className="text-xs font-medium px-3 py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-[var(--surface-alt)] text-[var(--foreground)] cursor-pointer flex items-center justify-between gap-2"
                      >
                        <span>{tab}</span>
                        <span className="flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--foreground-muted)]">
                            {count}
                          </span>
                          <ListBox.ItemIndicator />
                        </span>
                      </ListBox.Item>
                    );
                  })}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          <div className="w-44">
            <Select
              aria-label="Sort orders"
              selectedKey={sortBy}
              onSelectionChange={(key) => {
                setSortBy(String(key ?? "newest"));
                setPage(1);
              }}
            >
              <Select.Trigger className="h-10 w-full px-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-between gap-1.5 cursor-pointer hover:border-primary transition-colors shadow-xs [&>span]:text-xs [&>span]:font-semibold">
                <Select.Value className="text-xs font-semibold truncate">
                  {({ selectedText }) => (
                    <span className="truncate">{selectedText}</span>
                  )}
                </Select.Value>
                <Select.Indicator className="[&>svg]:w-3.5 [&>svg]:h-3.5 text-[var(--foreground-muted)] shrink-0" />
              </Select.Trigger>
              <Select.Popover className="w-52 p-1.5 bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl shadow-xl z-50">
                <ListBox>
                  {SORT_OPTIONS.map((opt) => (
                    <ListBox.Item
                      key={opt.key}
                      id={opt.key}
                      textValue={opt.label}
                      className="text-xs font-medium px-3 py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-[var(--surface-alt)] text-[var(--foreground)] cursor-pointer flex items-center justify-between"
                    >
                      {opt.label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Orders Cards List ── */}
      {filteredOrders.length === 0 ? (
        <Card className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              No orders found
            </h2>
            <p className="text-xs text-[var(--foreground-muted)]">
              {searchQuery
                ? "No orders matched your search keyword."
                : `You do not have any ${selectedTab !== "All Orders" ? selectedTab.toLowerCase() : ""} orders yet.`}
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all"
          >
            <span>Start Shopping</span>
          </Link>
        </Card>
      ) : (
        <div className="space-y-5">
          {visibleOrders.map((order) => (
            <Card
              key={order.id}
              className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xs space-y-4 p-0"
            >
              {/* Order Card Header */}
              <div className="p-4 sm:p-5 bg-[var(--surface-alt)] border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-[var(--foreground-muted)] text-[10px] uppercase font-bold block">
                      Order Number
                    </span>
                    <span className="font-extrabold text-[var(--foreground)]">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--foreground-muted)] text-[10px] uppercase font-bold block">
                      Date Placed
                    </span>
                    <span className="font-semibold text-[var(--foreground)] opacity-90">
                      {order.date}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--foreground-muted)] text-[10px] uppercase font-bold block">
                      Total Amount
                    </span>
                    <span className="font-black text-[var(--foreground)]">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                  {Boolean(order.couponDiscount) && (
                    <div>
                      <span className="text-[var(--foreground-muted)] text-[10px] uppercase font-bold block">
                        Discount code
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(order.couponDiscount || 0)}{" "}
                        <span className="text-[10px] opacity-80">{order.couponCode}</span>
                      </span>
                    </div>
                  )}
                  {Boolean(order.pointsDiscount) && (
                    <div>
                      <span className="text-[var(--foreground-muted)] text-[10px] uppercase font-bold block">
                        Points Saved
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(order.pointsDiscount || 0)} ({order.pointsRedeemed} pts)
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-[var(--foreground-muted)] text-[10px] uppercase font-bold block">
                      Shipping Method
                    </span>
                    <span className="font-semibold text-[var(--foreground)] opacity-90">
                      {shippingMethodLabel(order.shippingMethod)}
                    </span>
                  </div>
                  {order.estimatedDelivery && (
                    <div>
                      <span className="text-[var(--foreground-muted)] text-[10px] uppercase font-bold block">
                        Est. Delivery
                      </span>
                      <span className="font-semibold text-[var(--foreground)] opacity-90">
                        {order.estimatedDelivery}
                      </span>
                    </div>
                  )}
                  {order.rejectionReason && (
                    <div className="sm:col-span-2">
                      <span className="text-[10px] uppercase font-bold block text-rose-500">
                        Seller&apos;s reason
                      </span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {order.rejectionReason}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Status Badge */}
                  <OrderStatusBadge status={order.status} pulse={order.status === "Shipped"} />

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadInvoice(order)}
                    isDisabled={downloadingOrderId === order.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--surface-alt)] text-xs font-semibold text-[var(--foreground)] transition-colors cursor-pointer h-8 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Download
                      className={`w-3.5 h-3.5 ${
                        downloadingOrderId === order.id ? "animate-pulse" : ""
                      }`}
                    />
                    <span className="hidden sm:inline">
                      {downloadingOrderId === order.id ? "Preparing" : "Invoice"}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Order Items List */}
              <div className="p-4 sm:p-5 space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)] last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-16 h-16 rounded-xl bg-[var(--surface-alt)] p-1.5 border border-[var(--border-color)] shrink-0 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/shop/${item.slug}`}
                          className="text-xs sm:text-sm font-bold text-[var(--foreground)] hover:text-primary transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                          Qty: {item.quantity} • {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {isProductOutOfStock(item) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                          Out of Stock
                        </span>
                      )}

                      <Button
                        size="sm"
                        isDisabled={loadingItemId === item.id}
                        onClick={() => handleBuyAgain(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer h-8 ${
                          isProductOutOfStock(item)
                            ? "bg-rose-50/80 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/80 dark:border-rose-900/40"
                            : "bg-[var(--surface-alt)] hover:bg-[var(--surface-alt)]/80 text-[var(--foreground)] border border-[var(--border-color)]"
                        }`}
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${loadingItemId === item.id ? "animate-spin" : ""}`} />
                        <span>{loadingItemId === item.id ? "Adding..." : "Buy Again"}</span>
                      </Button>

                      {isDeliveredOrder(order) && (
                        <Link
                          href={`/shop/${item.slug}#reviews`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 text-xs font-semibold transition-colors h-8 flex items-center"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer with Tracking CTA */}
              <div className="p-4 sm:p-5 pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--foreground-muted)]">
                <div>
                  <span>Paid with {order.paymentMethod}</span>
                  {order.trackingNumber && (
                    <span className="ml-2 font-mono text-[11px] text-primary">
                      • {order.carrier}: #{order.trackingNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {canCancelOrder(order) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCancelTarget(order);
                        setCancelReason("");
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-rose-600 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold transition-colors cursor-pointer h-8"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancel order</span>
                    </Button>
                  )}
                  {order.timeline && (
                    <Button
                      size="sm"
                      onClick={() => openTrackingModal(order)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold transition-colors cursor-pointer h-8 border border-primary/20"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Track Shipment</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-[var(--foreground-muted)]">
            Showing{" "}
            <span className="font-bold text-[var(--foreground)]">
              {pageStart + 1}–{Math.min(pageStart + ORDERS_PER_PAGE, filteredOrders.length)}
            </span>{" "}
            of <span className="font-bold text-[var(--foreground)]">{filteredOrders.length}</span> orders
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                isDisabled={currentPage <= 1}
                onPress={() => goToPage(currentPage - 1)}
                className="h-9 px-3 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Previous
              </Button>
              <span className="px-1 font-semibold text-[var(--foreground-muted)]">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                isDisabled={currentPage >= totalPages}
                onPress={() => goToPage(currentPage + 1)}
                className="h-9 px-3 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Order Tracking Modal ──
        The overlay itself scrolls, and the dialog is centred with auto margins
        rather than `items-center`. Centring a box taller than the viewport
        pushes its top above the scroll area, where no amount of scrolling
        reaches it — on a phone this dialog is routinely taller than the screen,
        and the Close and Track live buttons simply were not there. */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center p-3 sm:p-4 bg-[var(--surface)]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-3xl w-full max-w-lg md:max-w-3xl my-auto p-5 sm:p-6 shadow-2xl space-y-5 sm:space-y-6 text-[var(--foreground)]">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-[var(--foreground)]">
                    Tracking: {trackingModalOrder.orderNumber}
                  </h3>
                  <OrderStatusBadge status={trackingModalOrder.status} size="sm" />
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  {tracking?.delivery ? (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                        DELIVERY_STATUS_STYLES[tracking.delivery.status] ??
                        "bg-[var(--surface-alt)] text-[var(--foreground-muted)] border-[var(--border-color)]"
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      {DELIVERY_STATUS_NEUTRAL_LABELS[tracking.delivery.status] ??
                        "In progress"}
                    </span>
                  ) : trackingModalOrder.trackingNumber ? (
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {trackingModalOrder.carrier ?? "Carrier"} • #
                      {trackingModalOrder.trackingNumber}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {trackingLoading ? "Loading delivery…" : "Preparing your order"}
                    </p>
                  )}
                  {trackingModalOrder.trackingNumber && (
                    <button
                      onClick={() => copyTracking(trackingModalOrder.trackingNumber!)}
                      className="text-primary hover:underline cursor-pointer"
                      title="Copy Tracking #"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {trackingLoading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--foreground-muted)]" />
                  )}
                </div>
              </div>
              <Button
                size="sm"
                isIconOnly
                variant="ghost"
                onClick={() => setTrackingModalOrder(null)}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm font-bold p-1 h-8 w-8 min-w-0"
              >
                ✕
              </Button>
            </div>

            {/* Shipping Method + Estimated Delivery */}
            <div className="flex flex-wrap items-center gap-2.5 -mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-alt)] border border-[var(--border-color)] text-[11px] font-bold text-[var(--foreground)]">
                <Truck className="w-3.5 h-3.5 text-primary" />
                {shippingMethodLabel(trackingModalOrder.shippingMethod)}
              </span>
              {trackingModalOrder.estimatedDelivery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-alt)] border border-[var(--border-color)] text-[11px] font-semibold text-[var(--foreground-secondary)]">
                  <Calendar className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
                  Est. {trackingModalOrder.estimatedDelivery}
                </span>
              )}
            </div>

            {/* The rider, full width: the Call button needs the room, and the two
                progress lists below are the parcel's story, not the person's. */}
            {tracking?.delivery?.rider && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface-alt)] border border-[var(--border-color)] -mt-1">
                <UserAvatar
                  src={tracking.delivery.rider.image}
                  name={tracking.delivery.rider.name}
                  size={40}
                  alt={tracking.delivery.rider.name}
                  className="rounded-xl bg-brand-gradient text-[var(--on-grad-text)] text-xs font-extrabold border border-[var(--border-color)]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--foreground)] truncate">
                    {tracking.delivery.rider.name}
                  </p>
                  <p className="text-[11px] text-[var(--foreground-muted)] flex items-center gap-1 truncate">
                    <Bike className="w-3 h-3 shrink-0" />
                    {[
                      tracking.delivery.rider.vehicleType,
                      tracking.delivery.rider.vehicleNumber,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Your rider"}
                  </p>
                </div>
                {tracking.delivery.rider.phone && (
                  <a
                    href={`tel:${tracking.delivery.rider.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl bg-primary hover:bg-primary-hover text-white text-[11px] font-bold shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call
                  </a>
                )}
              </div>
            )}

            {/*
              The two progress lists: what the rider is driving now, and how the
              order got here. Side by side when there is room for two columns,
              one under the other on a phone. Each gets its own frame so the two
              lists never read as one long list, and when no rider has been
              assigned the grid folds away instead of leaving a blank column
              beside the order's own timeline.
            */}
            <div
              className={
                tracking?.delivery
                  ? "grid grid-cols-1 md:grid-cols-2 gap-4 items-start"
                  : undefined
              }
            >
              {tracking?.delivery && (
                <div className="rounded-2xl border border-[var(--border-color)] p-3.5 sm:p-4 space-y-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                    Delivery progress
                  </p>
                  {deliverySteps.map((step) => {
                    const done = Boolean(step.at);
                    return (
                      <div key={step.key} className="flex gap-3 items-center">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            done
                              ? "bg-primary text-white"
                              : "bg-[var(--surface-alt)] text-[var(--foreground-muted)] border border-[var(--border-color)]"
                          }`}
                        >
                          {done ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                          <span
                            className={`text-[11px] font-semibold truncate ${
                              done
                                ? "text-[var(--foreground)]"
                                : "text-[var(--foreground-muted)]"
                            }`}
                          >
                            {step.label}
                          </span>
                          {step.at && (
                            <span className="text-[10px] text-[var(--foreground-muted)] shrink-0">
                              {formatMoment(step.at)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {tracking.eta && isDeliveryLive && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Navigation className="w-3.5 h-3.5 shrink-0" />
                      Arriving in about {formatEta(tracking.eta.minutes)}
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-2xl border border-[var(--border-color)] p-3.5 sm:p-4 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Order progress
                </p>
                {trackingModalOrder.timeline.map((step, idx) => (
                  <div key={idx} className="flex gap-3 sm:gap-4 items-start relative">
                    {idx !== trackingModalOrder.timeline.length - 1 && (
                      /*
                        Stretched between this node and the next one instead of a
                        fixed height: a row is as tall as its description, so a
                        40px segment left a visible gap in the line.
                      */
                      <div
                        className={`absolute left-3.5 top-7 -bottom-4 w-0.5 ${
                          step.completed ? "bg-primary" : "bg-[var(--border-color)]"
                        }`}
                      />
                    )}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        step.completed
                          ? "bg-primary text-white shadow-xs"
                          : step.current
                            ? "bg-amber-400 text-amber-950 ring-4 ring-amber-100 dark:ring-amber-950/60 animate-pulse"
                            : "bg-[var(--surface-alt)] text-[var(--foreground-muted)] border border-[var(--border-color)]"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-[var(--foreground)]">
                          {step.title}
                        </p>
                        <span className="text-[10px] text-[var(--foreground-muted)] font-medium shrink-0 text-right">
                          {step.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-[var(--foreground-muted)]">
                <span>Shipping to: </span>
                <span className="font-semibold text-[var(--foreground)] block sm:inline">
                  {trackingModalOrder.shippingAddress}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
                {tracking?.delivery && (
                  <Button
                    onClick={refreshTracking}
                    isDisabled={trackingLoading}
                    className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--foreground)] font-bold transition-colors cursor-pointer"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${trackingLoading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                )}
                {/* The stepper above is the order's own story; this is the map
                    with the rider carrying it, which only the live page has. */}
                <Link
                  href={`/track-order/${trackingModalOrder.id}`}
                  className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Track live
                </Link>
                <Button
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all cursor-pointer shrink-0 h-9"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Cancel order — only while the order is still being packed */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-[var(--surface)]/60 backdrop-blur-xs">
          <Card className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-[var(--foreground)]">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2 text-rose-600">
                <XCircle className="w-5 h-5" />
                Cancel {cancelTarget.orderNumber}
              </h3>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                The order is still being packed, so it can be called off. Once it
                ships it can no longer be cancelled from here.
              </p>
            </div>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Why are you cancelling? (optional — the store reads this)"
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setCancelTarget(null)}
                isDisabled={isCancelling}
                className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-[var(--border-color)] text-[var(--foreground)]"
              >
                Keep order
              </Button>
              <Button
                onClick={handleConfirmCancel}
                isDisabled={isCancelling}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                {isCancelling ? "Cancelling..." : "Cancel order"}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
    </>
  );
}
