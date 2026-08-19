import { Schema, model, models, Types, Model } from "mongoose";

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
