/**
 * The shape a vendor card leaves behind while its rows are still on the way.
 *
 * Mirrors `VendorCard`'s frame — cover on top, signboard and two lines of copy
 * under it, the numbers strip and the footer call — so a grid swaps bones for
 * cards without shifting the page.
 */
export default function VendorCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden animate-pulse">
      <div className="h-28 sm:h-32 bg-[var(--surface-alt)]" />
      <div className="p-4 pt-9 space-y-2.5">
        <div className="h-4 w-2/3 rounded-md bg-[var(--surface-alt)]" />
        <div className="h-2.5 w-full rounded-md bg-[var(--surface-alt)]" />
        <div className="h-2.5 w-3/4 rounded-md bg-[var(--surface-alt)]" />
        <div className="h-9 w-full rounded-xl bg-[var(--surface-alt)]" />
      </div>
      <div className="h-[41px] border-t border-[var(--border-color)]" />
    </div>
  );
}
