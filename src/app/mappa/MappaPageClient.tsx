'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const MappaMagnifica = dynamic(() => import('@/components/MappaMagnifica'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Caricamento mappa...</div>,
});

const MappaPageClient = () => {
  return (
    <div>
      <MappaMagnifica />
    </div>
  );
};

export default MappaPageClient;
