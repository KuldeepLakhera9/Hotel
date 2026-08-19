"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Listing } from "@/lib/models/Listing";
import { Review } from "@/lib/models/Review";
import { hasPermission } from "@/lib/rbac";
import { logAdminAction } from "@/lib/audit";

type ActionResult = { success: true } | { success: false; error: string };

export async function adminDeleteReview(reviewId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, "manageReviews")) {
    return { success: false, error: "You do not have permission to moderate reviews" };
  }

  await connectDB();
  const review = await Review.findById(reviewId);
  if (!review) return { success: false, error: "Review not found" };

  await Listing.updateMany({ reviews: reviewId }, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  await logAdminAction(session.user.id, "REVIEW_DELETED", "Review", reviewId);

  revalidatePath("/admin/reviews");
  return { success: true };
}
