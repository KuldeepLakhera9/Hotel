import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import type { IListing } from "@/lib/models/Listing";

export async function getUserWishlistIds(userId: string): Promise<string[]> {
  await connectDB();
  const user = await User.findById(userId).select("wishlist").lean();
  return user?.wishlist.map((id) => id.toString()) ?? [];
}

export async function getWishlistListings(userId: string) {
  await connectDB();
  const user = await User.findById(userId)
    .populate<{ wishlist: IListing[] }>("wishlist")
    .lean();
  return user?.wishlist ?? [];
}
