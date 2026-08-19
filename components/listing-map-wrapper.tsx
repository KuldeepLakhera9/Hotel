"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` at module scope in places, so the actual map
// must never render on the server.
export const ListingMapWrapper = dynamic(
  () => import("@/components/listing-map").then((mod) => mod.ListingMap),
  {
    ssr: false,
    loading: () => <div className="h-80 animate-pulse rounded-2xl bg-muted" />,
  }
);
