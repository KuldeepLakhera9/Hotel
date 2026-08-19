import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getAllBookingsAdmin } from "@/lib/data/admin";
import { hasPermission } from "@/lib/rbac";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Badge } from "@/components/ui/badge";
import { RefundButton } from "@/components/admin/refund-button";

export const metadata: Metadata = { title: "Bookings & Payments — Wanderlust Admin" };

export default async function AdminBookingsPage() {
  const session = await auth();
  const canRefund = hasPermission(session?.user?.role, "issueRefunds");
  const bookings = await getAllBookingsAdmin();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Bookings &amp; Payments ({bookings.length})</h1>

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Payment</th>
              {canRefund && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id.toString()} className="border-t border-border">
                <td className="px-4 py-3">
                  <p className="font-medium">{b.user?.username ? `@${b.user.username}` : "Deleted user"}</p>
                  <p className="text-xs text-muted-foreground">{b.user?.email}</p>
                </td>
                <td className="px-4 py-3">{b.listing?.title ?? "Deleted listing"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(b.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                  {new Date(b.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </td>
                <td className="px-4 py-3">₹{b.totalPrice.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <BookingStatusBadge status={b.status} />
                </td>
                <td className="px-4 py-3">
                  <Badge variant={b.payment?.status === "succeeded" ? "success" : "outline"}>
                    {b.payment?.status ?? "no payment"}
                  </Badge>
                </td>
                {canRefund && (
                  <td className="px-4 py-3">
                    {b.status === "Confirmed" && b.payment?.status === "succeeded" && (
                      <RefundButton bookingId={b._id.toString()} />
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
