"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setListingActive, adminDeleteListing } from "@/lib/actions/admin/listings";
import { Button } from "@/components/ui/button";

export function ListingActions({ listingId, isActive }: { listingId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const result = await setListingActive(listingId, !isActive);
            if (!result.success) toast.error(result.error);
            else toast.success(isActive ? "Listing deactivated" : "Listing reactivated");
          });
        }}
      >
        {isActive ? "Deactivate" : "Reactivate"}
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Permanently delete this listing and all its reviews? This cannot be undone.")) return;
          startTransition(async () => {
            const result = await adminDeleteListing(listingId);
            if (!result.success) toast.error(result.error);
            else toast.success("Listing deleted");
          });
        }}
      >
        Delete
      </Button>
    </div>
  );
}
