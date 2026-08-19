"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminDeleteReview } from "@/lib/actions/admin/reviews";
import { Button } from "@/components/ui/button";

export function AdminReviewDeleteButton({ reviewId }: { reviewId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Delete this review?")) return;
        startTransition(async () => {
          const result = await adminDeleteReview(reviewId);
          if (!result.success) toast.error(result.error);
          else toast.success("Review deleted");
        });
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
