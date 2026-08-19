"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({ listingId, initialSaved }: { listingId: string; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !saved;
        setSaved(next);
        startTransition(async () => {
          const result = await toggleWishlist(listingId);
          if (!result.success) {
            setSaved(!next);
            toast.error(result.error);
          }
        });
      }}
      className="flex size-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:scale-110 disabled:opacity-60"
    >
      <Heart className={cn("size-4", saved ? "fill-primary text-primary" : "text-foreground")} />
    </button>
  );
}
