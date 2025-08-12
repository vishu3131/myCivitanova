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

"use client";

import dynamic from "next/dynamic";
import React, { useEffect } from "react";
import Script from "next/script";

const ARExperience = dynamic(() => import("@/components/ARExperience"), {
  ssr: false,
});

export default function ARExperiencePage() {
  useEffect(() => {
    // Prevent scroll bounce on mobile during AR
    const original = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = original;
    };
  }, []);

  return (
    <main className="min-h-screen bg-black">
      {/* A-Frame and AR.js scripts */}
      <Script
        src="https://aframe.io/releases/1.5.0/aframe.min.js"
        strategy="afterInteractive"
      />
      <Script
        // AR.js build with location-based components
        src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar-nft.js"
        strategy="afterInteractive"
      />
      {/* GPS camera extension (aframe-gps-camera / arjs) usually included in AR.js build.
          If needed, include a dedicated gps component script.
      */}
      <div className="h-screen w-screen">
        <ARExperience />
      </div>
    </main>
  );
}


