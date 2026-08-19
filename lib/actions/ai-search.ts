"use server";

import { connectDB } from "@/lib/db";
import { Listing } from "@/lib/models/Listing";
import { LISTING_CATEGORIES } from "@/lib/constants/listing";

export type AiChatListing = {
  id: string;
  title: string;
  location: string;
  country: string;
  price: number;
  image: string;
  category: string;
};

export type AiChatResult = { reply: string; listings: AiChatListing[] };

const KEYWORDS = [
  "goa",
  "mumbai",
  "delhi",
  "manali",
  "tuscany",
  "aspen",
  "london",
  "paris",
  "beach",
  "mountain",
  "villa",
  "cottage",
  "cabin",
  "loft",
];

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e";

/**
 * Ported from the legacy controllers/ai.js as-is (per the confirmed
 * decision to keep this feature). It's not an LLM call — it's local
 * keyword/regex matching against listings dressed up as a chat widget.
 */
export async function aiChatSearch(message: string): Promise<AiChatResult | { error: string }> {
  if (!message) {
    return { error: "Message is required" };
  }

  await connectDB();
  const queryLower = message.toLowerCase();

  let maxPrice: number | null = null;
  const priceMatch = queryLower.match(/(?:under|below|less than|budget of)\s*(?:₹|rs\.?|inr)?\s*(\d+k?)/i);
  if (priceMatch?.[1]) {
    const rawP = priceMatch[1].toLowerCase();
    maxPrice = rawP.endsWith("k") ? Number.parseInt(rawP) * 1000 : Number.parseInt(rawP);
  }

  let matchedCategory: string | null = null;
  for (const cat of LISTING_CATEGORIES) {
    const catLower = cat.toLowerCase();
    if (
      queryLower.includes(catLower) ||
      (cat === "Pools" && queryLower.includes("pool")) ||
      (cat === "Mountains" && (queryLower.includes("mountain") || queryLower.includes("cabin")))
    ) {
      matchedCategory = cat;
      break;
    }
  }

  const filter: Record<string, unknown> = {};
  if (matchedCategory) filter.category = matchedCategory;
  if (maxPrice) filter.price = { $lte: maxPrice };

  let matchedKeyword: string | null = null;
  for (const kw of KEYWORDS) {
    if (queryLower.includes(kw)) {
      matchedKeyword = kw;
      break;
    }
  }

  if (matchedKeyword && !matchedCategory) {
    const searchRegex = new RegExp(matchedKeyword, "i");
    filter.$or = [
      { title: searchRegex },
      { location: searchRegex },
      { country: searchRegex },
      { description: searchRegex },
    ];
  }

  let recommendedListings = await Listing.find(filter).limit(4).lean();
  if (recommendedListings.length === 0) {
    recommendedListings = await Listing.find({}).limit(3).lean();
  }

  let responseText: string;
  if (queryLower.includes("itinerary") || queryLower.includes("plan")) {
    responseText =
      "Here is a custom 3-Day Travel Itinerary for your trip:\n\n" +
      "**Day 1: Arrival & Local Exploration**\nCheck into your stay, enjoy local street food, and relax with sunset views.\n\n" +
      "**Day 2: Adventure & Sightseeing**\nVisit famous landmarks, try local water sports or mountain hikes, and dine at top-rated restaurants.\n\n" +
      "**Day 3: Souvenirs & Departure**\nExplore local artisan markets, grab souvenirs, and check out comfortably.\n\n" +
      "Here are top recommended stays for your trip:";
  } else {
    responseText = `I found **${recommendedListings.length} wonderful stay${recommendedListings.length > 1 ? "s" : ""}** matching your preferences! Here are my top recommendations:`;
  }

  return {
    reply: responseText,
    listings: recommendedListings.map((l) => ({
      id: l._id.toString(),
      title: l.title,
      location: l.location,
      country: l.country,
      price: l.price,
      image: l.image ? l.image.url : DEFAULT_IMAGE,
      category: l.category || "Trending",
    })),
  };
}
