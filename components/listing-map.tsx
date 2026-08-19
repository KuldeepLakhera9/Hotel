"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Bundlers break Leaflet's default marker icon asset resolution; point it at
// the CDN copies instead of trying to wire up local asset imports.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  href?: string;
};

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 1) {
      map.fitBounds(markers.map((m) => [m.lat, m.lng]));
    } else if (markers.length === 1 && markers[0]) {
      map.setView([markers[0].lat, markers[0].lng], 12);
    }
  }, [map, markers]);
  return null;
}

export function ListingMap({ markers, height = 320 }: { markers: MapMarker[]; height?: number }) {
  const center = markers[0] ? ([markers[0].lat, markers[0].lng] as [number, number]) : ([20, 0] as [number, number]);

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-border">
      <MapContainer center={center} zoom={markers.length ? 12 : 2} scrollWheelZoom={false} className="size-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={markerIcon}>
            <Popup>
              <p className="font-semibold">{m.title}</p>
              {m.subtitle && <p className="text-sm text-muted-foreground">{m.subtitle}</p>}
              {m.href && (
                <a href={m.href} className="text-sm text-primary underline">
                  View listing
                </a>
              )}
            </Popup>
          </Marker>
        ))}
        <FitBounds markers={markers} />
      </MapContainer>
    </div>
  );
}
