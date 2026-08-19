// See lib/models/User.ts for why this is a default import + destructure
// rather than named imports (Mongoose's CJS named exports break under
// tsx's native ESM loading, e.g. scripts/seed.ts).
import mongoose, { type Model, type Types } from "mongoose";
const { Schema, model, models } = mongoose;

export interface IReview {
  _id: Types.ObjectId;
  comment: string;
  rating: number;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  // `timestamps: true` replaces the legacy schema's manual
  // `createdAt: { default: Date.now() }` field, which called Date.now()
  // once at module-load time instead of per document — every review
  // created during a server process's lifetime shared one timestamp.
  { timestamps: true }
);

export const Review = (models.Review as Model<IReview>) || model<IReview>("Review", reviewSchema);
