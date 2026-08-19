import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Payment } from "@/lib/models/Payment";
import { getStripe } from "@/lib/stripe";

// A guest who starts checkout but never pays (or pays after abandoning
// and the tab-close/webhook backstops in Phase 5 somehow both miss it)
// leaves a Pending booking holding those dates indefinitely — there's no
// other reaper for it. Vercel Cron calls this on the schedule in
// vercel.json, authenticated via CRON_SECRET (Vercel auto-attaches
// `Authorization: Bearer $CRON_SECRET` when that env var is set — see
// https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs).
const STALE_AFTER_MS = 60 * 60 * 1000; // 1 hour

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  await connectDB();
  const staleBefore = new Date(Date.now() - STALE_AFTER_MS);

  const staleBookings = await Booking.find({ status: "Pending", createdAt: { $lt: staleBefore } });
  if (staleBookings.length === 0) {
    return NextResponse.json({ expired: 0 });
  }

  const staleIds = staleBookings.map((b) => b._id);
  await Booking.updateMany({ _id: { $in: staleIds } }, { status: "Cancelled" });

  const payments = await Payment.find({ bookingId: { $in: staleIds }, status: "pending" });
  await Payment.updateMany({ _id: { $in: payments.map((p) => p._id) } }, { status: "failed" });

  // Best-effort — also tell Stripe the session is dead so a guest can't
  // resurrect it with an old tab. Wrapped so a missing STRIPE_SECRET_KEY or
  // a flaky Stripe call can't turn into a 500 that masks the DB cleanup
  // above, which already succeeded and is what actually frees the dates.
  try {
    const stripe = getStripe();
    await Promise.allSettled(
      payments
        .filter((p) => p.stripeCheckoutSessionId)
        .map((p) => stripe.checkout.sessions.expire(p.stripeCheckoutSessionId!))
    );
  } catch (err) {
    console.error("Failed to expire Stripe checkout sessions for stale bookings", err);
  }

  return NextResponse.json({ expired: staleBookings.length });
}
