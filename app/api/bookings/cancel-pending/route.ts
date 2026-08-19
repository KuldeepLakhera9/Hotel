import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Payment } from "@/lib/models/Payment";

/**
 * Stripe Checkout's cancel_url — reached when a guest backs out of
 * checkout instead of paying. Without this, the Pending booking created
 * before the redirect keeps holding those dates (it counts toward the
 * double-booking check), which would even block the same guest from
 * re-attempting the same dates. Releases the hold before sending them back.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const bookingId = url.searchParams.get("bookingId");
  const listingId = url.searchParams.get("listingId");
  const redirectTo = new URL(listingId ? `/listings/${listingId}?payment=cancelled` : "/listings", req.url);

  const session = await auth();
  if (session?.user && bookingId) {
    await connectDB();
    const booking = await Booking.findById(bookingId);
    if (booking && booking.user.equals(session.user.id) && booking.status === "Pending") {
      booking.status = "Cancelled";
      await booking.save();
      await Payment.findOneAndUpdate({ bookingId: booking._id, status: "pending" }, { status: "failed" });
    }
  }

  return NextResponse.redirect(redirectTo);
}
