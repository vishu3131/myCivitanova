"use client";

import Script from "next/script";
import dynamic from "next/dynamic";

// Carica il componente solo lato client
const ARExperience = dynamic(() => import("@/components/ARExperience"), {
  ssr: false,
});

export default function ARExperiencePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Script necessari: A-Frame e AR.js (con estensioni GPS) */}
      <Script
        src="https://cdn.jsdelivr.net/npm/aframe@1.4.1/dist/aframe.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/aframe/build/aframe-ar.js"
        strategy="afterInteractive"
      />

      <ARExperience />
    </div>
  );
}