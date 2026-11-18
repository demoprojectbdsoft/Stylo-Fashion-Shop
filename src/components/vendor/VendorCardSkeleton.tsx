/**
 * The shape a vendor card leaves behind while its rows are still on the way.
 *
 * Mirrors `VendorCard`'s frame — cover on top, signboard and two lines of copy
 * under it — so a grid swaps bones for cards without shifting the page.
 */
export default function VendorCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden animate-pulse">
      <div className="h-24 bg-[var(--surface-alt)]" />
      <div className="p-4 pt-7 space-y-2.5">
        <div className="h-3.5 w-2/3 rounded-md bg-[var(--surface-alt)]" />
        <div className="h-2.5 w-full rounded-md bg-[var(--surface-alt)]" />
        <div className="h-2.5 w-3/4 rounded-md bg-[var(--surface-alt)]" />
      </div>
    </div>
  );
}
