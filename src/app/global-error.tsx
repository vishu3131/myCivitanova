"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log in console (utile in dev e in sentry se presente)
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.error("GlobalError:", error);
  }

  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Errore applicazione</title>
      </head>
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          backgroundColor: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: 20, lineHeight: 1.2, margin: "0 0 12px" }}>
            Si è verificato un errore inatteso
          </h2>
          <p
            style={{
              fontSize: 14,
              opacity: 0.8,
              margin: 0,
            }}
          >
            {process.env.NODE_ENV === "development"
              ? error?.message || ""
              : "Riprova tra qualche istante."}
          </p>
          {error?.digest && (
            <p
              style={{
                fontSize: 12,
                opacity: 0.5,
                marginTop: 8,
              }}
            >
              Digest: {error.digest}
            </p>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              marginTop: 20,
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "#D8FF00",
                color: "#000",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Riprova
            </button>
            <a
              href="/"
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Vai alla Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
