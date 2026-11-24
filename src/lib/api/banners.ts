import { serverFetch } from "../core/server";
import type { Banner } from "@/types/banner";

/** The homepage read: only banners eligible right now. */
export const getBanners = async (): Promise<{ data?: Banner[] }> => {
  return serverFetch("/banners");
};

/** The desk read: every banner, drafts and past ones included. */
export const getAdminBanners = async (): Promise<{ data?: Banner[] }> => {
  return serverFetch("/banners/admin", true);
};
