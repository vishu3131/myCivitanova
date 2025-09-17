import React from 'react';
import { MobileEventsScreen } from '@/components/MobileEventsScreen';

export default function EventiPage() {
  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileEventsScreen />
      </div>
      
      {/* Desktop View */}
      <div className="hidden md:block">
        <MobileEventsScreen />
      </div>
    </>
  );
}

export async function __ensureServerManifest() {
  'use server';
}