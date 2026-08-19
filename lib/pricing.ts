// Centralizes the pricing formula that the legacy app duplicated verbatim
// in controllers/booking.js (authoritative) and public/js/script.js (UI
// preview only) — a single source now used by both the server action and
// the client-side live preview.
export type PriceBreakdown = {
  nights: number;
  baseTotal: number;
  gstTax: number;
  cleaningFee: number;
  grandTotal: number;
};

export function calculateBookingPrice(pricePerNight: number, checkIn: Date, checkOut: Date): PriceBreakdown {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const baseTotal = pricePerNight * nights;
  const gstTax = Math.round(baseTotal * 0.18);
  const cleaningFee = Math.round(pricePerNight * 0.1);
  const grandTotal = baseTotal + gstTax + cleaningFee;
  return { nights, baseTotal, gstTax, cleaningFee, grandTotal };
}
