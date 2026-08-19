import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Listing } from "@/lib/models/Listing";
import { Review } from "@/lib/models/Review";
import { getAverageRating } from "@/lib/rating";
import type { IListing } from "@/lib/models/Listing";
import type { IUser } from "@/lib/models/User";

export async function getUserBookings(userId: string) {
  await connectDB();
  return Booking.find({ user: userId })
    .populate<{ listing: (IListing & { owner: IUser | null }) | null }>({
      path: "listing",
      populate: { path: "owner" },
    })
    .sort({ createdAt: -1 })
    .lean();
}

export async function getHostDashboardData(ownerId: string) {
  await connectDB();
  const myListings = await Listing.find({ owner: ownerId }).sort({ createdAt: -1 }).lean();
  const listingIds = myListings.map((l) => l._id);

  const hostBookings = await Booking.find({ listing: { $in: listingIds } })
    .populate<{ listing: IListing | null }>("listing")
    .populate<{ user: IUser | null }>("user")
    .sort({ createdAt: -1 })
    .lean();

  const totalRevenue = hostBookings
    .filter((b) => b.status === "Confirmed")
    .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  // Real average across every review on every listing this host owns —
  // replaces the legacy dashboard's hardcoded "Host Rating: 4.92 / 5".
  const reviewIds = myListings.flatMap((l) => l.reviews);
  const reviews = await Review.find({ _id: { $in: reviewIds } }).select("rating").lean();
  const hostRating = getAverageRating(reviews);

  return {
    myListings,
    hostBookings,
    totalRevenue,
    totalStays: myListings.length,
    totalBookings: hostBookings.length,
    hostRating,
  };
}
