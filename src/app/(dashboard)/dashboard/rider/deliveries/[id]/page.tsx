import { notFound } from "next/navigation";
import { getRequiredRole } from "@/lib/core/session";
import { getRiderDelivery } from "@/lib/api/deliveries";
import RiderDeliveryDetail from "./RiderDeliveryDetail";

export const dynamic = "force-dynamic";

interface RiderDeliveryPageProps {
  params: Promise<{ id: string }>;
}

/**
 * One delivery, on a page of its own.
 *
 * The rider has to collect a parcel from one or more shops (or the store's own
 * warehouse) and hand it to a customer, so this page gathers every address and
 * line in one place: the pickup points, the drop-off, the money to collect, and
 * the buttons to accept or decline while the offer is live.
 */
export default async function RiderDeliveryPage({ params }: RiderDeliveryPageProps) {
  await getRequiredRole("rider");

  const { id } = await params;
  const res = await getRiderDelivery(id);
  const delivery = res?.data ?? null;
  if (!delivery) notFound();

  return <RiderDeliveryDetail delivery={delivery} />;
}
