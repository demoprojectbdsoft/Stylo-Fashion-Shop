"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Layers } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { setActiveRole } from "@/lib/action/user";
import { useDashboardRole } from "@/hooks/useDashboardRole";

/**
 * The dashboard shell's housekeeping, mounted once by the layout. It names the
 * workspace the reader is in (one toast per workspace, and only for one the
 * account actually holds) and then brings the session's `activeRole` hint back
 * in line with the page — after navigation, so a failed write breaks nothing.
 */
export default function DashboardWorkspaceSync() {
  const router = useRouter();
  const { refetch } = authClient.useSession();
  const { user, workspace, label, heldRoles, canEnter } = useDashboardRole();

  // Remembered per account, so signing out and in again re-announces.
  const announced = useRef("");
  const mirrored = useRef("");
  const key = `${user?.id ?? "anon"}:${workspace}`;

  // ── 1. Say which dashboard this is ────────────────────────────────────────
  useEffect(() => {
    if (!user || !canEnter(workspace)) return;
    if (announced.current === key) return;
    announced.current = key;
    toast.info(`You are in the ${label} dashboard`, {
      // One toast for the whole app: a new workspace replaces the old note
      // instead of piling up behind it.
      toastId: "dashboard-workspace",
      icon: <Layers className="w-4 h-4" />,
      autoClose: 2600,
    });
  }, [canEnter, key, label, user, workspace]);

  // ── 2. Repair the session hint the URL has outgrown ───────────────────────
  //
  // Only a value the switch endpoint will accept is ever sent: the buyer, rider
  // or seller entry the account holds, or `admin` for staff who hold it. The
  // sandbox account's own entry cannot be written by that endpoint at all, so a
  // demo admin leaves the hint alone rather than collecting a refusal.
  const mirrorTarget =
    workspace === "customer" && heldRoles.includes("customer")
      ? "customer"
      : workspace === "vendor" && heldRoles.includes("vendor")
        ? "vendor"
        : workspace === "rider" && heldRoles.includes("rider")
          ? "rider"
          : workspace === "admin" && heldRoles.includes("admin")
            ? "admin"
            : null;
  const sessionHint = String(user?.activeRole || user?.role || "").toLowerCase();

  useEffect(() => {
    if (!user || !mirrorTarget || !canEnter(workspace)) return;
    if (mirrored.current === key) return;
    if (sessionHint === mirrorTarget) {
      mirrored.current = key;
      return;
    }
    mirrored.current = key;

    (async () => {
      try {
        await setActiveRole(mirrorTarget);
        // The hint belongs to a row better-auth only partly knows about, so the
        // cached session is read again with the cookie cache bypassed and the
        // route is re-rendered from it. A failed re-read is not a failed visit:
        // the page on screen already came from the URL.
        try {
          await refetch({ query: { disableCookieCache: true } });
        } catch {
          // The refresh below re-reads the session on its own.
        }
        router.refresh();
      } catch {
        // Nothing to tell the reader. They are where they asked to be.
      }
    })();
  }, [canEnter, key, mirrorTarget, refetch, router, sessionHint, user, workspace]);

  // The shell draws everything else; this only keeps the two in step.
  return null;
}
