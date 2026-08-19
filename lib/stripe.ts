import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Lazy singleton — deliberately NOT constructed at module load time.
 * lib/actions/booking.ts (which needs this) is imported by the listing
 * show page just to register the Server Action reference, so throwing at
 * import time the way lib/db.ts does for ATLASDB_URL would take down
 * listing browsing entirely whenever Stripe isn't configured yet, not just
 * the booking step. Construct on first actual use instead.
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing STRIPE_SECRET_KEY environment variable. Set it in .env.local (dev) or in Vercel's Production/Preview environment variables."
      );
    }
    stripeInstance = new Stripe(apiKey);
  }
  return stripeInstance;
}
