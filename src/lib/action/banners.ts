"use server";

import { serverMutation } from "../core/server";
import type { Banner } from "@/types/banner";

export const addBanner = async (data: Partial<Banner> | Record<string, unknown>) => {
  return serverMutation(`/banners`, data);
};

export const updateBanner = async (id: string, data: Record<string, unknown>) => {
  return serverMutation(`/banners/${id}`, data, "PATCH");
};

export const deleteBanner = async (id: string) => {
  return serverMutation(`/banners/${id}`, {}, "DELETE");
};
