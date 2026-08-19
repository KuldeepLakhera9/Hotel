// See lib/models/User.ts for why this is a default import + destructure
// rather than named imports (Mongoose's CJS named exports break under
// tsx's native ESM loading, e.g. scripts/seed.ts).
import mongoose, { type Model, type Types } from "mongoose";
const { Schema, model, models } = mongoose;

// Pending: created, awaiting Stripe payment confirmation via webhook.
// Confirmed: webhook confirmed payment succeeded.
// Cancelled: guest cancelled before check-in (refund issued, see Payment).
// Refunded: payment refunded (guest cancellation or admin-issued refund).
export const BOOKING_STATUSES = ["Pending", "Confirmed", "Cancelled", "Refunded"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface IBooking {
  _id: Types.ObjectId;
  listing: Types.ObjectId;
  user: Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, default: 1 },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: BOOKING_STATUSES, default: "Pending" },
  },
  { timestamps: true }
);

// Availability lookups filter by listing + status + date range on every
// booking attempt (see lib/actions/booking.ts) — index the fields that
// query actually filters on.
bookingSchema.index({ listing: 1, status: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

export const Booking = (models.Booking as Model<IBooking>) || model<IBooking>("Booking", bookingSchema);
