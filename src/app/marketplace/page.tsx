import React, { Suspense } from "react";
import MarketplaceClient from "../../components/MarketplaceClient";

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div>Loading marketplace...</div>}>
      <MarketplaceClient />
    </Suspense>
  );
}
