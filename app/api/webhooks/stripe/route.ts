import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Payment } from "@/lib/models/Payment";

// Booking is only ever marked Confirmed/Refunded from here, never from the
// client redirect after checkout — a guest closing the success tab, losing
// network, or Stripe silently retrying doesn't change what actually
// happened to the payment, so this webhook is the single source of truth.
export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await connectDB();

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const bookingId = checkoutSession.metadata?.bookingId;
      if (!bookingId) break;

      const paymentIntentId =
        typeof checkoutSession.payment_intent === "string"
          ? checkoutSession.payment_intent
          : checkoutSession.payment_intent?.id;

      await Booking.findByIdAndUpdate(bookingId, { status: "Confirmed" });
      await Payment.findOneAndUpdate(
        { stripeCheckoutSessionId: checkoutSession.id },
        {
          status: "succeeded",
          stripePaymentIntentId: paymentIntentId,
          amount: (checkoutSession.amount_total ?? 0) / 100,
        },
        { upsert: false }
      );
      break;
    }

    case "checkout.session.expired": {
      // Backstop for a guest who closes the tab without ever hitting
      // cancel_url (which normally releases the hold immediately, see
      // app/api/bookings/cancel-pending/route.ts) — Stripe expires an
      // unpaid session automatically (24h by default), and this is that
      // notification.
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const bookingId = checkoutSession.metadata?.bookingId;
      if (!bookingId) break;

      await Payment.findOneAndUpdate(
        { stripeCheckoutSessionId: checkoutSession.id, status: "pending" },
        { status: "failed" }
      );
      await Booking.updateOne({ _id: bookingId, status: "Pending" }, { status: "Cancelled" });
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata?.bookingId;
      if (!bookingId) break;

      await Payment.findOneAndUpdate(
        { bookingId },
        { status: "failed", stripePaymentIntentId: paymentIntent.id }
      );
      // No retry-payment flow exists yet, and an unpaid Pending booking
      // would otherwise hold these dates indefinitely (there's no expiry
      // job) — cancel it outright so the dates free up immediately.
      await Booking.findByIdAndUpdate(bookingId, { status: "Cancelled" });
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (!paymentIntentId) break;

      const payment = await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        { status: "refunded" }
      );
      if (payment) {
        await Booking.findByIdAndUpdate(payment.bookingId, { status: "Refunded" });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
