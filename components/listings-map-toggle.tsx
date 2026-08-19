"use client";

import { useState } from "react";
import { Map, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingMapWrapper } from "@/components/listing-map-wrapper";
import type { MapMarker } from "@/components/listing-map";

export function ListingsMapToggle({ markers }: { markers: MapMarker[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4">
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
        {open ? <X className="size-4" /> : <Map className="size-4" />}
        {open ? "Hide map" : "Show map"}
      </Button>
      {open && (
        <div className="mt-3">
          <ListingMapWrapper markers={markers} height={360} />
        </div>
      )}
    </div>
  );
}
