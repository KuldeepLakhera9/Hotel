"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { cancelBooking } from "@/lib/actions/booking";
import { Button } from "@/components/ui/button";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Cancel this reservation?")) return;
        startTransition(async () => {
          const result = await cancelBooking(bookingId);
          if (!result.success) toast.error(result.error);
          else toast.success("Booking cancelled");
        });
      }}
    >
      {isPending ? "Cancelling..." : "Cancel reservation"}
    </Button>
  );
}
