"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";
import { createReview } from "@/lib/actions/review";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ReviewForm({ listingId }: { listingId: string }) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const rating = watch("rating");

  function onSubmit(data: ReviewInput) {
    startTransition(async () => {
      const result = await createReview(listingId, data);
      if (result.success) {
        toast.success("Review posted!");
        reset({ rating: 0, comment: "" });
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-2xl border border-border p-4">
      <div>
        <Label>Your rating</Label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              onClick={() => setValue("rating", value, { shouldValidate: true })}
            >
              <Star
                className={cn(
                  "size-6 transition-colors",
                  value <= rating ? "fill-primary text-primary" : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
        {errors.rating && <p className="mt-1 text-xs text-destructive">{errors.rating.message}</p>}
      </div>

      <div>
        <Label htmlFor="comment">Share your experience</Label>
        <Textarea id="comment" {...register("comment")} className="mt-1" placeholder="How was your stay?" />
        {errors.comment && <p className="mt-1 text-xs text-destructive">{errors.comment.message}</p>}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Posting..." : "Post review"}
      </Button>
    </form>
  );
}
