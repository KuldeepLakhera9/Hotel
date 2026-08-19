"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Listing } from "@/lib/models/Listing";
import { calculateBookingPrice } from "@/lib/pricing";
import { bookingSchema, type BookingInput } from "@/lib/validations/booking";

type ActionError = { success: false; error: string };

export async function createBooking(listingId: string, input: BookingInput): Promise<ActionError | void> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "You must be logged in to book a stay" };
  }

  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await connectDB();
  const listing = await Listing.findById(listingId);
  if (!listing) {
    return { success: false, error: "Listing not found" };
  }

  const checkInDate = new Date(parsed.data.checkIn);
  const checkOutDate = new Date(parsed.data.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
    return { success: false, error: "Please select a valid check-in and check-out date" };
  }
  if (checkInDate < today) {
    return { success: false, error: "Check-in date cannot be in the past" };
  }

  // Held ("Pending") bookings count toward the overlap check too, not just
  // Confirmed ones — the legacy app only checked Confirmed, but now that a
  // booking can sit Pending while checkout happens (Stripe integration
  // lands next phase), letting a second guest book the same dates during
  // that window would be a real double-booking hole. The tradeoff: an
  // abandoned Pending booking holds the dates until it's cancelled or
  // expires — there's no cleanup job yet, worth adding (e.g. a Vercel Cron
  // Job) once Stripe checkout is wired in.
  const overlapping = await Booking.findOne({
    listing: listingId,
    status: { $in: ["Pending", "Confirmed"] },
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
  });
  if (overlapping) {
    return { success: false, error: "Sorry, this property is already booked for the selected dates!" };
  }

  const { grandTotal } = calculateBookingPrice(listing.price, checkInDate, checkOutDate);

  await Booking.create({
    listing: listingId,
    user: session.user.id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: parsed.data.guests,
    totalPrice: grandTotal,
    status: "Pending",
  });

  revalidatePath("/bookings");
  revalidatePath(`/listings/${listingId}`);
  redirect("/bookings");
}

export async function cancelBooking(bookingId: string): Promise<ActionError | { success: true }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "You must be logged in" };
  }

  await connectDB();
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return { success: false, error: "Booking not found" };
  }
  if (!booking.user.equals(session.user.id)) {
    return { success: false, error: "You do not have permission to cancel this booking" };
  }

  // TODO(Phase 5): once Payment/Stripe exists, cancelling a Confirmed
  // booking should trigger an automatic refund here rather than just
  // flipping status.
  booking.status = "Cancelled";
  await booking.save();

  revalidatePath("/bookings");
  revalidatePath(`/listings/${booking.listing.toString()}`);
  return { success: true };
}
