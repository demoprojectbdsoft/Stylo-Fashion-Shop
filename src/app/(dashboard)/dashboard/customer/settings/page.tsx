import React from "react";
import CustomerSettingsClient, {
  CustomerSettingsData,
} from "./CustomerSettingsClient";
import { getUserSession } from "@/lib/core/session";
import { getUserById } from "@/lib/api/user";

// ── All Settings Dummy/Default Data Kept In Page.tsx ──
const INITIAL_SETTINGS_DATA: CustomerSettingsData = {
  preferences: {
    language: "en",
  },
  notifications: {
    inApp: true,
    email: true,
  },
  security: {
    twoFactor: false,
    activeSessions: [
      {
        id: "sess-1",
        device: "Windows PC (Chrome 124)",
        location: "Springfield, OR, USA",
        lastActive: "Active Now",
        isCurrent: true,
      },
      {
        id: "sess-2",
        device: "iPhone 15 Pro (Safari Mobile)",
        location: "Portland, OR, USA",
        lastActive: "2 hours ago",
        isCurrent: false,
      },
    ],
  },
};

async function getSettingsData(): Promise<CustomerSettingsData> {
  try {
    // The bell and email switches live on the account, so the screen starts on
    // what the API has stored rather than a guess.
    const session = await getUserSession();
    const res = session?.id ? await getUserById(session.id) : null;
    const user = (res as { data?: { notificationsEnabled?: boolean; emailNotificationsEnabled?: boolean } } | null)?.data;

    return {
      ...INITIAL_SETTINGS_DATA,
      notifications: {
        inApp: user?.notificationsEnabled !== false,
        email: user?.emailNotificationsEnabled !== false,
      },
    };
  } catch (error) {
    console.error("Failed to fetch customer settings:", error);
    return INITIAL_SETTINGS_DATA;
  }
}

export default async function CustomerSettingsPage() {
  const settingsData = await getSettingsData();
  return <CustomerSettingsClient initialSettings={settingsData} />;
}
