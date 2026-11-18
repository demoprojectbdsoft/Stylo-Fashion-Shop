import React from "react";
import { notFound } from "next/navigation";
import { getRequiredRole } from "@/lib/core/session";
import { asVendorBoardDetail, getVendorBoardDetail } from "@/lib/api/vendor";
import { getSiteSettings } from "@/lib/api/siteSettings";
import VendorDashboardClient from "./VendorDashboardClient";

export const dynamic = "force-dynamic";

interface VendorDashboardPageProps {
  params: Promise<{ id: string }>;
}

/**
 * One seller, in full.
 *
 * The read happens on the server and the page refuses to render from a stale
 * payload: every visit asks the API for the current row, the plan periods, the
 * listings, the placements and the codes. The id may be the seller's account id
 * or the shop's — both are what the other desks hold — and the API resolves
 * either to the same seller.
 */
export default async function VendorDashboardPage({ params }: VendorDashboardPageProps) {
  await getRequiredRole("admin");

  const { id } = await params;
  const [detailRes, settingsRes] = await Promise.all([getVendorBoardDetail(id), getSiteSettings()]);
  const detail = asVendorBoardDetail(detailRes);

  if (!detail) {
    notFound();
  }

  return (
    <VendorDashboardClient detail={detail} currency={settingsRes?.data?.currency || "BDT"} />
  );
}
