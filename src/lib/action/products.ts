"use server";

import { serverMutation } from "../core/server";
import { getUserSession } from "../core/session";

export const addProduct = async (data: Record<string, unknown>) => {
  const user = await getUserSession();
  return serverMutation(`/products`, { ...data, ownerId: user?.id });
};

export const updateProduct = async (id: string, data: Record<string, unknown>) => {
  return serverMutation(`/products/${id}`, data, "PATCH");
};

export const deleteProduct = async (id: string) => {
  return serverMutation(`/products/${id}`, {}, "DELETE");
};

export const archiveProduct = async (id: string) => {
  return serverMutation(`/products/${id}/archive`, {}, "PATCH");
};

export const unarchiveProduct = async (id: string) => {
  return serverMutation(`/products/${id}/unarchive`, {}, "PATCH");
};

/**
 * The review desk's decision on a seller's listing.
 *
 * Approving is the only way a listing reaches the shop; a rejection must carry
 * the reason the seller needs in order to fix it and resubmit.
 */
export const reviewVendorProduct = async (
  id: string,
  decision: "approve" | "reject",
  reason?: string
) => {
  return serverMutation(`/products/${id}/review`, { decision, reason }, "PATCH");
};

