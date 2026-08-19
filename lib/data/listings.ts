import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Listing } from "@/lib/models/Listing";
import type { IUser } from "@/lib/models/User";
import type { IReview } from "@/lib/models/Review";

export async function getListings(params: { category?: string; query?: string }) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (params.category) filter.category = params.category;
  if (params.query) filter.$text = { $search: params.query };

  return Listing.find(filter)
    .sort(params.query ? { score: { $meta: "textScore" } } : { createdAt: -1 })
    .lean();
}

export type PopulatedListing = Awaited<ReturnType<typeof getListingById>>;

export async function getListingById(id: string) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;

  const listing = await Listing.findById(id)
    .populate<{ reviews: (IReview & { author: IUser })[] }>({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate<{ owner: IUser }>("owner")
    .lean();

  return listing;
}

export async function getListingsByOwner(ownerId: string) {
  await connectDB();
  return Listing.find({ owner: ownerId }).sort({ createdAt: -1 }).lean();
}
