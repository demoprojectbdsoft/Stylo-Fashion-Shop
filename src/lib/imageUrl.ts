/**
 * Unwraps nested `/_next/image?url=...` proxy links (for example from an older
 * deployment) so images load directly from their origin URL instead of 404ing
 * on a retired host.
 */
export function normalizeImageUrl(raw?: string | null): string {
  const value = (raw ?? "").trim();
  if (!value) return "";

  try {
    const parsed = new URL(value, "http://localhost");
    if (parsed.pathname === "/_next/image") {
      const inner = parsed.searchParams.get("url");
      if (inner) return inner;
    }
  } catch {
    // Keep non-URL strings (e.g. relative paths) as-is.
  }

  return value;
}
