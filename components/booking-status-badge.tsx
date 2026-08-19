import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/models/Booking";

const VARIANTS: Record<BookingStatus, "success" | "warning" | "destructive" | "secondary"> = {
  Confirmed: "success",
  Pending: "warning",
  Cancelled: "destructive",
  Refunded: "secondary",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={VARIANTS[status]}>{status}</Badge>;
}
