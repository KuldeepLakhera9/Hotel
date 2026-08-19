"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { createBooking } from "@/lib/actions/booking";
import { calculateBookingPrice } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function todayISO() {
  return new Date().toISOString().split("T")[0]!;
}

export function BookingWidget({ listingId, pricePerNight }: { listingId: string; pricePerNight: number }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [isPending, startTransition] = useTransition();

  const breakdown = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime()) || outDate <= inDate) return null;
    return calculateBookingPrice(pricePerNight, inDate, outDate);
  }, [checkIn, checkOut, pricePerNight]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createBooking(listingId, { checkIn, checkOut, guests });
      if (result && !result.success) toast.error(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border p-5 shadow-sm">
      <p className="text-lg font-semibold">
        ₹{pricePerNight.toLocaleString("en-IN")}{" "}
        <span className="text-sm font-normal text-muted-foreground">/ night</span>
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="checkIn">Check-in</Label>
          <Input
            id="checkIn"
            type="date"
            min={todayISO()}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="checkOut">Check-out</Label>
          <Input
            id="checkOut"
            type="date"
            min={checkIn || todayISO()}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="guests">Guests</Label>
        <Input
          id="guests"
          type="number"
          min={1}
          max={20}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value) || 1)}
          className="mt-1"
          required
        />
      </div>

      {breakdown && (
        <div className="space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              ₹{pricePerNight.toLocaleString("en-IN")} × {breakdown.nights} night{breakdown.nights > 1 ? "s" : ""}
            </span>
            <span>₹{breakdown.baseTotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (18%)</span>
            <span>₹{breakdown.gstTax.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cleaning fee</span>
            <span>₹{breakdown.cleaningFee.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1 font-semibold">
            <span>Total</span>
            <span>₹{breakdown.grandTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending || !breakdown}>
        {isPending ? "Booking..." : "Book Now"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">You won&apos;t be charged yet</p>
    </form>
  );
}
