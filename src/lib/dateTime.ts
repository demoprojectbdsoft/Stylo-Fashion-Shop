// Dates are shown in the store's timezone, so server and browser agree.
// Change STORE_TIME_ZONE to move the whole app.

export const STORE_TIME_ZONE = "Asia/Dhaka";

const dateOnly = new Intl.DateTimeFormat("en-US", {
  timeZone: STORE_TIME_ZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateAndTime = new Intl.DateTimeFormat("en-US", {
  timeZone: STORE_TIME_ZONE,
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const longDateTime = new Intl.DateTimeFormat("en-US", {
  timeZone: STORE_TIME_ZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** Returns a valid Date, or null when the value is missing or unreadable. */
function toDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/** "Oct 30, 2026" — for an order's placed-on date. */
export function formatOrderDate(value?: string | Date | null): string {
  const date = toDate(value);
  return date ? dateOnly.format(date) : "";
}

const monthYear = new Intl.DateTimeFormat("en-US", {
  timeZone: STORE_TIME_ZONE,
  month: "long",
  year: "numeric",
});

/** "October 2026" — for "member since" lines. */
export function formatMonthYear(value?: string | Date | null): string {
  const date = toDate(value);
  return date ? monthYear.format(date) : "";
}

/** "Oct 30, 2:45 PM" — for timeline steps. */
export function formatOrderMoment(value?: string | Date | null): string {
  const date = toDate(value);
  return date ? dateAndTime.format(date) : "";
}

/** "Oct 30, 2026, 2:45 PM" — for "submitted at" and "placed on" lines. */
export function formatOrderDateTime(value?: string | Date | null): string {
  const date = toDate(value);
  return date ? longDateTime.format(date) : "";
}

/**
 * "just now", "12m ago", "3h ago", "2d ago" — for the notification bells.
 *
 * `nowMs` is the caller's idea of "now", so the bell can measure against the
 * API clock instead of a device whose clock happens to be wrong.
 */
export function formatTimeAgo(value?: string | Date | null, nowMs: number = Date.now()): string {
  const date = toDate(value);
  if (!date) return "";

  // Never negative: a stamp a second ahead of the clock still reads "now".
  const minutes = Math.floor(Math.max(0, nowMs - date.getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}
