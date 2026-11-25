import React from "react";
import { getAdminBanners } from "@/lib/api/banners";
import HeroBannersClient from "./HeroBannersClient";

export const dynamic = "force-dynamic";

export default async function AdminHeroBannersPage() {
  const bannersRes = await getAdminBanners();
  const banners = Array.isArray(bannersRes?.data) ? bannersRes.data : [];

  return <HeroBannersClient initialBanners={banners} />;
}
