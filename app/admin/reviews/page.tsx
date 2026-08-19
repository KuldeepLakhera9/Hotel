import Link from "next/link";
import type { Metadata } from "next";
import { Star } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllReviewsAdmin } from "@/lib/data/admin";
import { hasPermission } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { AdminReviewDeleteButton } from "@/components/admin/review-delete-button";

export const metadata: Metadata = { title: "Reviews — Wanderlust Admin" };

export default async function AdminReviewsPage() {
  const session = await auth();
  const canManage = hasPermission(session?.user?.role, "manageReviews");
  const reviews = await getAllReviewsAdmin();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Reviews ({reviews.length})</h1>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review._id.toString()} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-white p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {review.author?.username ? `@${review.author.username}` : "Deleted user"}
                </p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star key={v} className={cn("size-3.5", v <= review.rating ? "fill-primary text-primary" : "text-border")} />
                  ))}
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
              {review.listing && (
                <Link href={`/listings/${review.listing._id}`} className="mt-1 inline-block text-xs text-primary underline">
                  on {review.listing.title}
                </Link>
              )}
            </div>
            {canManage && <AdminReviewDeleteButton reviewId={review._id.toString()} />}
          </div>
        ))}
      </div>
    </div>
  );
}
