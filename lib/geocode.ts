// Nominatim (OpenStreetMap) geocoding — free, no API key, pairs with the
// Leaflet/OSM map stack already in use. Replaces the legacy app's fake
// ~10-substring hardcoded lookup that silently pinned anything unmatched to
// New Delhi.
//
// Usage policy (https://operations.osmfoundation.org/policies/nominatim/)
// requires a descriptive User-Agent identifying the app — replace the
// placeholder below with your own domain/contact before going to production.
const NOMINATIM_USER_AGENT = "Wanderlust-App/1.0 (https://your-production-domain.example)";
const FALLBACK_COORDINATES: [number, number] = [77.209, 28.6139]; // New Delhi — matches the Listing schema default

export async function geocodeLocation(location: string, country: string): Promise<[number, number]> {
  const query = `${location}, ${country}`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": NOMINATIM_USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Nominatim responded ${res.status}`);

    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    const first = results[0];
    if (first) {
      const lon = Number.parseFloat(first.lon);
      const lat = Number.parseFloat(first.lat);
      if (Number.isFinite(lon) && Number.isFinite(lat)) {
        return [lon, lat];
      }
    }
  } catch (err) {
    console.error(`Geocoding failed for "${query}":`, err);
  }

  return FALLBACK_COORDINATES;
}
