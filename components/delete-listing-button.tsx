"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteListing } from "@/lib/actions/listing";
import { Button } from "@/components/ui/button";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Delete this listing? This cannot be undone.")) return;
        startTransition(async () => {
          const result = await deleteListing(listingId);
          if (result && !result.success) toast.error(result.error);
        });
      }}
    >
      <Trash2 className="size-4" />
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
