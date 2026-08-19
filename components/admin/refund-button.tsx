"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { refundBooking } from "@/lib/actions/payment";
import { Button } from "@/components/ui/button";

export function RefundButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Issue a full refund for this booking via Stripe?")) return;
        startTransition(async () => {
          const result = await refundBooking(bookingId);
          if (!result.success) toast.error(result.error);
          else toast.success("Refund initiated — status updates once Stripe confirms it");
        });
      }}
    >
      {isPending ? "Refunding..." : "Refund"}
    </Button>
  );
}
