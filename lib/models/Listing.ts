import { Schema, model, models, Types, Model } from "mongoose";
import { Review } from "./Review";
import { LISTING_CATEGORIES, AMENITY_OPTIONS, type ListingCategory } from "@/lib/constants/listing";

// Re-exported for server-side code that already imports these from here —
// the canonical definitions live in lib/constants/listing.ts (no Mongoose
// import) so Client Components can import just the constants safely.
export { LISTING_CATEGORIES, AMENITY_OPTIONS };
export type { ListingCategory };

export interface IListing {
  _id: Types.ObjectId;
  title: string;
  description: string;
  image: { url: string; filename: string };
  price: number;
  location: string;
  country: string;
  category: ListingCategory;
  geometry: { type: "Point"; coordinates: [number, number] };
  amenities: string[];
  reviews: Types.ObjectId[];
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const listingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      filename: { type: String, required: true },
    },
    price: { type: Number, required: true, min: 0 },
    location: { type: String, required: true },
    country: { type: String, required: true },
    category: { type: String, enum: LISTING_CATEGORIES, default: "Trending" },
    geometry: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [77.209, 28.6139] },
    },
    amenities: [{ type: String }],
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

listingSchema.index({ location: "text", country: "text", title: "text", description: "text" });
listingSchema.index({ category: 1 });
listingSchema.index({ price: 1 });

// Cascade-delete a listing's reviews. Only fires for findOneAndDelete /
// findByIdAndDelete (what the app actually uses) — a deleteOne/deleteMany
// call would silently skip this, so always delete listings via
// findByIdAndDelete.
listingSchema.post("findOneAndDelete", async function (listing: IListing | null) {
  if (listing && listing.reviews.length > 0) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

export const Listing = (models.Listing as Model<IListing>) || model<IListing>("Listing", listingSchema);
