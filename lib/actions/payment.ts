"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Payment } from "@/lib/models/Payment";
import { getStripe } from "@/lib/stripe";
import { logAdminAction } from "@/lib/audit";
import type { Role } from "@/lib/models/User";

type ActionResult = { success: true } | { success: false; error: string };

const REFUND_ROLES = new Set<Role>(["SUPER_ADMIN", "ADMIN"]);

/**
 * Admin-triggered refund (SUPER_ADMIN/ADMIN only — SUPPORT_ADMIN is
 * explicitly view-only and cannot issue refunds per the RBAC spec). Only
 * calls Stripe's refund API; Booking/Payment status flips to
 * Refunded/refunded via the charge.refunded webhook, not synchronously
 * here, so a failed webhook delivery can't leave the DB out of sync with
 * what Stripe actually did.
 */
export async function refundBooking(bookingId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !REFUND_ROLES.has(session.user.role)) {
    return { success: false, error: "You do not have permission to issue refunds" };
  }

  await connectDB();
  const payment = await Payment.findOne({ bookingId, status: "succeeded" });
  if (!payment?.stripePaymentIntentId) {
    return { success: false, error: "No successful payment found for this booking" };
  }

  try {
    const stripe = getStripe();
    await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });
  } catch (err) {
    console.error("Admin-triggered refund failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Refund failed" };
  }

  await logAdminAction(session.user.id, "REFUND_ISSUED", "Payment", payment._id.toString(), { bookingId });

  revalidatePath("/admin/bookings");
  revalidatePath("/bookings");
  return { success: true };
}
