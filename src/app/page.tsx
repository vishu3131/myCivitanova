"use client";

import { MobileHomeScreen } from '@/components/MobileHomeScreen';
import '@/styles/desktop-message.css';

export default function Home() {
  return (
    <>
      {/* Mobile View */}
      <div className="mobile-only-content">
        <MobileHomeScreen />
      </div>

      {/* Desktop View Message */}
      <div className="desktop-only-message">
        L'app funziona solo in versione mobile.
      </div>
    </>
  );
}
