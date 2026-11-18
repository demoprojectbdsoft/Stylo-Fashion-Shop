"use client";

import React from "react";

/**
 * The last resort: the root layout itself threw, so nothing — no fonts, no
 * palette, no chrome — survived. This screen is written with plain inline styles
 * on purpose and keeps the same reload advice and error code the framework's own
 * fallback shows, so a report from a shopper is still something support can use.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const message = error.digest
    ? "A server error occurred. Reload to try again."
    : "Reload to try again.";

  return (
    <html lang="en" style={{ height: "100%", background: "#0b0f19" }}>
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          background: "#0b0f19",
          color: "#e2e8f0",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {/* Fixed to the viewport, not the document, so the card lands on the
            exact centre of what the shopper actually sees even if the body ever
            grows taller than the screen. The auto margins on the child keep tall
            content scrollable instead of clipping it. */}
        <main
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            overflowY: "auto",
            padding: 24,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              margin: "auto",
              width: "100%",
              maxWidth: 440,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                margin: "0 auto 18px",
                borderRadius: "50%",
                background: "rgba(244, 63, 94, 0.12)",
                color: "#fb7185",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              !
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
              This page couldn’t load
            </h1>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 20px" }}>{message}</p>
            <form>
              <button
                type="submit"
                style={{
                  background: "#0284c7",
                  color: "#fff",
                  border: 0,
                  borderRadius: 10,
                  padding: "10px 22px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Reload
              </button>
            </form>
            {error.digest && (
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 18, fontFamily: "monospace" }}>
                Code: {error.digest}
              </p>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}
