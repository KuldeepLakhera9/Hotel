import { connectDB } from "@/lib/db";
import { Listing } from "@/lib/models/Listing";
import { User } from "@/lib/models/User";
import { Booking } from "@/lib/models/Booking";
import { Payment } from "@/lib/models/Payment";
import { Review } from "@/lib/models/Review";
import { AuditLog } from "@/lib/models/AuditLog";
import type { IListing } from "@/lib/models/Listing";
import type { IUser } from "@/lib/models/User";
import type { IPayment } from "@/lib/models/Payment";

export async function getAllListingsAdmin() {
  await connectDB();
  return Listing.find({}).populate<{ owner: IUser | null }>("owner").sort({ createdAt: -1 }).lean();
}

export async function getAllUsersAdmin() {
  await connectDB();
  return User.find({}).sort({ createdAt: -1 }).lean();
}

export async function getAllBookingsAdmin() {
  await connectDB();
  const bookings = await Booking.find({})
    .populate<{ listing: IListing | null }>("listing")
    .populate<{ user: IUser | null }>("user")
    .sort({ createdAt: -1 })
    .lean();

  const payments = await Payment.find({ bookingId: { $in: bookings.map((b) => b._id) } }).lean();
  const paymentByBooking = new Map(payments.map((p) => [p.bookingId.toString(), p]));

  return bookings.map((b) => ({ ...b, payment: paymentByBooking.get(b._id.toString()) ?? null }));
}

export async function getAllReviewsAdmin() {
  await connectDB();
  const reviews = await Review.find({}).populate<{ author: IUser | null }>("author").sort({ createdAt: -1 }).lean();
  const listings = await Listing.find({ reviews: { $in: reviews.map((r) => r._id) } })
    .select("title reviews")
    .lean();

  const listingByReview = new Map<string, { _id: string; title: string }>();
  for (const listing of listings) {
    for (const reviewId of listing.reviews) {
      listingByReview.set(reviewId.toString(), { _id: listing._id.toString(), title: listing.title });
    }
  }

  return reviews.map((r) => ({ ...r, listing: listingByReview.get(r._id.toString()) ?? null }));
}

export async function getAuditLog(limit = 100) {
  await connectDB();
  return AuditLog.find({}).populate<{ admin: IUser | null }>("admin").sort({ createdAt: -1 }).limit(limit).lean();
}

export async function getAdminOverviewStats() {
  await connectDB();

  const [totalListings, activeListings, totalUsers, totalBookings, confirmedBookings, payments] = await Promise.all([
    Listing.countDocuments({}),
    Listing.countDocuments({ isActive: true }),
    User.countDocuments({}),
    Booking.countDocuments({}),
    Booking.countDocuments({ status: "Confirmed" }),
    Payment.find({ status: "succeeded" }).select("amount createdAt").lean(),
  ]);

  const totalRevenue = payments.reduce((acc: number, p: Pick<IPayment, "amount">) => acc + p.amount, 0);

  const revenueByDay = new Map<string, number>();
  const bookingsByDay = new Map<string, number>();
  for (const p of payments) {
    const day = p.createdAt.toISOString().slice(0, 10);
    revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + p.amount);
  }

  const recentBookings = await Booking.find({}).select("status createdAt").sort({ createdAt: -1 }).limit(500).lean();
  for (const b of recentBookings) {
    const day = b.createdAt.toISOString().slice(0, 10);
    bookingsByDay.set(day, (bookingsByDay.get(day) ?? 0) + 1);
  }

  const recentUsers = await User.find({}).select("createdAt").sort({ createdAt: -1 }).limit(500).lean();
  const usersByDay = new Map<string, number>();
  for (const u of recentUsers) {
    const day = u.createdAt.toISOString().slice(0, 10);
    usersByDay.set(day, (usersByDay.get(day) ?? 0) + 1);
  }

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });

  const dailySeries = days.map((day) => ({
    day: day.slice(5),
    revenue: revenueByDay.get(day) ?? 0,
    bookings: bookingsByDay.get(day) ?? 0,
    newUsers: usersByDay.get(day) ?? 0,
  }));

  return {
    totalListings,
    activeListings,
    totalUsers,
    totalBookings,
    confirmedBookings,
    totalRevenue,
    dailySeries,
  };
}
