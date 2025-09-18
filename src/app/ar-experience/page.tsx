"use client";

import Script from "next/script";
import dynamic from "next/dynamic";

// Caricamento lazy per componenti pesanti con messaggio in italiano
const ARExperience = dynamic(() => import('@/components/ARExperience'), {
  loading: () => <div className="bg-black/50 border border-white/20 rounded-xl animate-pulse p-6 text-center">
    <div className="space-y-4">
      <div className="text-4xl">🔍</div>
      <div className="h-4 bg-white/10 rounded w-3/4 mx-auto"></div>
      <div className="h-3 bg-white/10 rounded w-1/2 mx-auto"></div>
      <p className="text-white/80 text-sm">Caricamento esperienza AR...</p>
    </div>
  </div>,
  ssr: false
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
}        src="https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/aframe/build/aframe-ar.js"
        strategy="afterInteractive"
      />

      <ARExperience />
    </div>
  );
}