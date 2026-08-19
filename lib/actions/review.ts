"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Listing } from "@/lib/models/Listing";
import { Review } from "@/lib/models/Review";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";

type ActionResult = { success: true } | { success: false; error: string };

export async function createReview(listingId: string, input: ReviewInput): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You must be logged in to leave a review" };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await connectDB();
  const listing = await Listing.findById(listingId);
  if (!listing) return { success: false, error: "Listing not found" };

  const review = await Review.create({
    comment: parsed.data.comment,
    rating: parsed.data.rating,
    author: session.user.id,
  });
  listing.reviews.push(review._id);
  await listing.save();

  revalidatePath(`/listings/${listingId}`);
  return { success: true };
}

export async function deleteReview(listingId: string, reviewId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You must be logged in" };

  await connectDB();
  const review = await Review.findById(reviewId);
  if (!review) return { success: false, error: "Review not found" };
  if (!review.author.equals(session.user.id)) {
    return { success: false, error: "You did not create this review" };
  }

  await Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  revalidatePath(`/listings/${listingId}`);
  return { success: true };
}
