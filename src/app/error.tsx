"use client";

import React from "react";
import { AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";

/**
 * The screen a broken page falls back to.
 *
 * The root layout stays in place, so the shop's chrome and colours are still
 * around the message; only the page that failed is replaced.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-[60vh] w-full flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-4 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-8 shadow-sm">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
          <AlertTriangle className="h-6 w-6" />
        </span>

        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-[var(--foreground)]">This page could not load</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            The rest of the shop is fine. Try the page once more — if it keeps failing, the store
            team can look it up by the code below.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>

          {/* `reset()` only re-renders the failed segment; if the throw came from
              a stale chunk or the session, a full reload is the only escape. */}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-alt)] cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {error.digest && (
          <p className="text-[11px] font-mono text-[var(--muted-foreground)]">Code: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
