import { Schema, model, models, Types, Model } from "mongoose";

export const PAYMENT_STATUSES = ["pending", "succeeded", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface IPayment {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "inr" },
    stripeCheckoutSessionId: { type: String, index: true, sparse: true },
    stripePaymentIntentId: { type: String, index: true, sparse: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
  },
  { timestamps: true }
);

export const Payment = (models.Payment as Model<IPayment>) || model<IPayment>("Payment", paymentSchema);
