"use client";

import { useTransition } from "react";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteReview } from "@/lib/actions/review";
import { cn } from "@/lib/utils";

export function ReviewItem({
  listingId,
  reviewId,
  authorUsername,
  rating,
  comment,
  canDelete,
}: {
  listingId: string;
  reviewId: string;
  authorUsername: string;
  rating: number;
  comment: string;
  canDelete: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {authorUsername.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-semibold">@{authorUsername}</p>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((v) => (
                <Star key={v} className={cn("size-3.5", v <= rating ? "fill-primary text-primary" : "text-border")} />
              ))}
            </div>
          </div>
        </div>
        {canDelete && (
          <button
            aria-label="Delete review"
            disabled={isPending}
            onClick={() => {
              if (!confirm("Delete this review?")) return;
              startTransition(async () => {
                const result = await deleteReview(listingId, reviewId);
                if (!result.success) toast.error(result.error);
              });
            }}
            className="text-muted-foreground hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
      <p className="mt-2 text-sm">{comment}</p>
    </div>
  );
}
