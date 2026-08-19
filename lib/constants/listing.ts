// Pure constants, deliberately kept free of any Mongoose/Node-only import
// so Client Components can import them directly without pulling the
// mongoose/mongodb driver (tls, net, fs) into the browser bundle.

export const LISTING_CATEGORIES = [
  "Trending",
  "Rooms",
  "Iconic Cities",
  "Mountains",
  "Castles",
  "Camping",
  "Farms",
  "Arctic",
  "Domes",
  "Boats",
  "Pools",
] as const;
export type ListingCategory = (typeof LISTING_CATEGORIES)[number];

// The legacy schema had an `amenities` field no form ever collected — the
// show page just rendered the same hardcoded 6-item grid for every listing
// regardless of actual data. This is the real, editable list going forward.
export const AMENITY_OPTIONS = [
  "Wifi",
  "Free parking",
  "Air conditioning",
  "Kitchen",
  "TV",
  "Pool",
  "Washer",
  "Free breakfast",
] as const;
