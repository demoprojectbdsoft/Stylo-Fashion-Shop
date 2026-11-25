"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Chip } from "@heroui/react";
import {
  ArrowLeft,
  Banknote,
  Clock,
  MapPin,
  Package,
  Phone,
  Store,
  Truck,
  Warehouse,
} from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { DELIVERY_STATUS_LABELS, DELIVERY_STATUS_STYLES, formatMoment } from "@/lib/rider";
import type { DeliveryPickupPoint, DeliveryPickupWarehouse, DeliveryRecord } from "@/types/delivery";
import DeliveryActions from "@/components/dashboard/rider/DeliveryActions";

interface RiderDeliveryDetailProps {
  delivery: DeliveryRecord;
}

/** One collection point, as a card the rider can read at a glance. */
function PickupCard({ warehouse, fallback }: {
  warehouse?: DeliveryPickupWarehouse;
  fallback?: DeliveryPickupPoint;
}) {
  const lines = warehouse
    ? [warehouse.label, warehouse.address, warehouse.area, warehouse.city, warehouse.postalCode]
        .map((line) => (line || "").trim())
        .filter(Boolean)
    : [fallback?.address].filter(Boolean);
  const phone = warehouse?.phone || fallback?.phone || "";
  const name = warehouse?.name || fallback?.name || "Pickup point";

  return (
    <Card className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-4 shadow-xs">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-primary/10 p-2 text-primary shrink-0">
          <Warehouse className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold text-[var(--foreground)]">{name}</p>
          {lines.length > 0 ? (
            <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--foreground-muted)]">
              {lines.join(", ")}
            </p>
          ) : (
            <p className="mt-0.5 text-[11px] text-amber-600 dark:text-amber-400">
              No warehouse address set — ask the store before you leave.
            </p>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              <Phone className="w-3 h-3" />
              {phone}
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function RiderDeliveryDetail({ delivery }: RiderDeliveryDetailProps) {
  const router = useRouter();
  const { formatPrice } = useSiteSettings();

  const order = delivery.order ?? null;
  const pickup = delivery.pickup ?? null;
  const shops = pickup?.warehouses ?? [];
  const expired =
    delivery.status === "assigned" && delivery.expiresAt
      ? new Date(delivery.expiresAt).getTime() < Date.now()
      : false;

  const onChanged = () => router.refresh();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/rider/deliveries"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground-muted)] hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All deliveries
          </Link>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--foreground)] flex items-center gap-2.5">
            {delivery.orderNumber}
            <Chip size="sm" className={`border text-[10px] font-bold ${DELIVERY_STATUS_STYLES[delivery.status]}`}>
              {DELIVERY_STATUS_LABELS[delivery.status]}
            </Chip>
          </h1>
          <p className="text-xs text-[var(--foreground-muted)] mt-1">
            {delivery.items} item{delivery.items === 1 ? "" : "s"} · fee {formatPrice(delivery.fee)}
            {delivery.assignedBy?.name ? ` · assigned by ${delivery.assignedBy.name}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-[var(--foreground-muted)]">Your fee</p>
            <p className="text-lg font-extrabold text-[var(--foreground)]">{formatPrice(delivery.fee)}</p>
          </div>
          <DeliveryActions delivery={delivery} expired={expired} onChanged={onChanged} />
        </div>
      </div>

      {delivery.status === "assigned" && delivery.expiresAt && (
        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold ${
            expired
              ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
              : "bg-[var(--surface-alt)] text-[var(--foreground-muted)]"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          {expired ? "This request expired before it was answered." : `Respond before ${formatMoment(delivery.expiresAt)}`}
        </div>
      )}

      {/* Customer / drop-off */}
      <Card className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-[var(--foreground)]">Deliver to</h2>
        </div>
        <p className="text-sm font-bold text-[var(--foreground)]">
          {order?.address.fullName || delivery.customerName || "Customer"}
        </p>
        {(order?.address.phone || delivery.customerPhone) && (
          <a
            href={`tel:${order?.address.phone || delivery.customerPhone}`}
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Phone className="w-3 h-3" />
            {order?.address.phone || delivery.customerPhone}
          </a>
        )}
        <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-muted)]">
          {order?.address.address || delivery.address || "Address not recorded"}
          {(order?.address.city || delivery.city) && `, ${order?.address.city || delivery.city}`}
          {order?.address.postalCode ? ` ${order.address.postalCode}` : ""}
        </p>
      </Card>

      {/* Pickup route */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Store className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-[var(--foreground)]">Collect from</h2>
          <span className="text-[10px] font-semibold text-[var(--foreground-muted)]">
            {shops.length + (pickup ? 1 : 0)} stop
            {shops.length + (pickup ? 1 : 0) === 1 ? "" : "s"}
          </span>
        </div>

        <div className="space-y-2.5">
          {shops.map((shop, index) => (
            <div key={`${shop.name}-${index}`} className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {index + 1}
              </span>
              <div className="flex-1">
                <PickupCard warehouse={shop} fallback={pickup ?? undefined} />
              </div>
            </div>
          ))}

          {pickup && (
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--surface-alt)] text-[10px] font-bold text-[var(--foreground)]">
                {shops.length + 1}
              </span>
              <div className="flex-1">
                <PickupCard
                  fallback={{ ...pickup, name: "Store warehouse (admin desk)" }}
                />
                <p className="mt-1 pl-1 text-[10px] text-[var(--foreground-muted)]">
                  For any item the store itself sold rather than a shop.
                </p>
              </div>
            </div>
          )}
        </div>

        {shops.length > 1 && (
          <p className="mt-2 text-[10px] text-[var(--foreground-muted)]">
            This parcel is sold by {shops.length} shops — collect from each before the door.
          </p>
        )}
      </div>

      {/* Items */}
      <Card className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border-color)]">
          <Package className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-[var(--foreground)]">What you are carrying</h2>
        </div>
        <ul className="divide-y divide-[var(--border-color)]">
          {(order?.items ?? []).map((item, index) => (
            <li key={`${item.title}-${index}`} className="flex items-center gap-3 px-5 py-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--surface-alt)] overflow-hidden shrink-0">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[var(--foreground-muted)]">
                    <Package className="w-4 h-4" />
                  </span>
                )}
              </div>
              <span className="min-w-0 flex-1 text-xs font-semibold text-[var(--foreground)] truncate">
                {item.title}
              </span>
              <span className="text-[11px] text-[var(--foreground-muted)]">×{item.quantity}</span>
            </li>
          ))}
          {(order?.items ?? []).length === 0 && (
            <li className="px-5 py-4 text-xs text-[var(--foreground-muted)]">Item list not available.</li>
          )}
        </ul>
      </Card>

      {/* Money */}
      {order && (
        <Card className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Banknote className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-[var(--foreground)]">Money</h2>
          </div>

          {order.amountToCollect > 0 ? (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 px-4 py-3 mb-3">
              <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                Collect at the door (cash on delivery)
              </p>
              <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                {formatPrice(order.amountToCollect)}
              </p>
            </div>
          ) : (
            <p className="text-xs font-semibold text-[var(--foreground-muted)] mb-3">
              Already paid — collect nothing at the door.
            </p>
          )}

          <dl className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <dt className="text-[var(--foreground-muted)]">Subtotal</dt>
              <dd className="font-semibold text-[var(--foreground)]">{formatPrice(order.totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--foreground-muted)]">Shipping</dt>
              <dd className="font-semibold text-[var(--foreground)]">{formatPrice(order.totals.shipping)}</dd>
            </div>
            {order.totals.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-[var(--foreground-muted)]">Discount</dt>
                <dd className="font-semibold text-emerald-600 dark:text-emerald-400">
                  −{formatPrice(order.totals.discount)}
                </dd>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--border-color)] pt-1.5">
              <dt className="font-bold text-[var(--foreground)]">Order total</dt>
              <dd className="font-extrabold text-[var(--foreground)]">{formatPrice(order.totals.total)}</dd>
            </div>
          </dl>
        </Card>
      )}

      <div className="flex items-center gap-2 text-[11px] text-[var(--foreground-muted)]">
        <Truck className="w-3.5 h-3.5" />
        Last update {formatMoment(delivery.updatedAt)}
      </div>
    </div>
  );
}
