"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Listing } from "@/lib/models/Listing";
import { Payment } from "@/lib/models/Payment";
import { calculateBookingPrice } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe";
import { bookingSchema, type BookingInput } from "@/lib/validations/booking";

type ActionError = { success: false; error: string };

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

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
  // Confirmed ones — otherwise a second guest could book the same dates
  // while an earlier guest's Stripe checkout is still in flight. Tradeoff:
  // an abandoned Pending booking holds the dates with no expiry yet — a
  // Vercel Cron Job to expire stale Pending bookings would close this gap.
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

  const booking = await Booking.create({
    listing: listingId,
    user: session.user.id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: parsed.data.guests,
    totalPrice: grandTotal,
    status: "Pending",
  });

  const baseUrl = await getBaseUrl();
  const bookingId = booking._id.toString();

  let checkoutUrl: string;
  try {
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: listing.title,
              description: `${checkInDate.toLocaleDateString()} – ${checkOutDate.toLocaleDateString()}`,
              images: [listing.image.url],
            },
            unit_amount: Math.round(grandTotal * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: session.user.email ?? undefined,
      metadata: { bookingId },
      // Also stamped onto the resulting PaymentIntent (not just the
      // Checkout Session) so payment_intent.payment_failed — which fires
      // before any Payment doc has a stripePaymentIntentId to match on —
      // can still be traced back to this booking.
      payment_intent_data: { metadata: { bookingId } },
      success_url: `${baseUrl}/bookings?payment=success`,
      // Routed through a handler that releases this booking's date-hold
      // before bouncing back to the listing — see its file comment.
      cancel_url: `${baseUrl}/api/bookings/cancel-pending?bookingId=${bookingId}&listingId=${listingId}`,
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    await Payment.create({
      bookingId: booking._id,
      userId: session.user.id,
      amount: grandTotal,
      currency: "inr",
      stripeCheckoutSessionId: checkoutSession.id,
      status: "pending",
    });

    checkoutUrl = checkoutSession.url;
  } catch (err) {
    // Don't leave an unpayable Pending booking holding these dates forever.
    await Booking.findByIdAndDelete(booking._id);
    console.error("Failed to create Stripe checkout session", err);
    return { success: false, error: "Could not start checkout. Please try again." };
  }

  revalidatePath("/bookings");
  revalidatePath(`/listings/${listingId}`);
  redirect(checkoutUrl);
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

  if (booking.status === "Confirmed") {
    const payment = await Payment.findOne({ bookingId: booking._id, status: "succeeded" });
    if (!payment?.stripePaymentIntentId) {
      return { success: false, error: "Unable to locate the payment for this booking. Please contact support." };
    }
    try {
      const stripe = getStripe();
      await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });
    } catch (err) {
      console.error("Refund failed", err);
      return { success: false, error: "Failed to process the refund. Please try again or contact support." };
    }
    // Status flips Confirmed -> Refunded once the charge.refunded webhook
    // confirms it — same "webhook is the source of truth" rule that
    // governs payment confirmation, not just cancellation.
    revalidatePath("/bookings");
    return { success: true };
  }

  if (booking.status === "Pending") {
    booking.status = "Cancelled";
    await booking.save();
    revalidatePath("/bookings");
    revalidatePath(`/listings/${booking.listing.toString()}`);
    return { success: true };
  }

  return { success: false, error: "This booking cannot be cancelled" };
}
