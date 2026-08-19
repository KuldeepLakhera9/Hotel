import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserBookings } from "@/lib/data/bookings";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { CancelBookingButton } from "@/components/cancel-booking-button";

export const metadata: Metadata = { title: "My Bookings — Wanderlust" };

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/bookings");

  const bookings = await getUserBookings(session.user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
      <h1 className="mb-6 text-2xl font-bold">My Booked Stays</h1>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
          <p className="text-lg font-semibold text-foreground">No bookings yet</p>
          <p className="mt-1 text-sm">
            <Link href="/listings" className="text-primary underline">
              Browse stays
            </Link>{" "}
            to plan your next trip.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id.toString()} className="flex gap-4 rounded-2xl border border-border p-4">
              {booking.listing ? (
                <>
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={booking.listing.image.url}
                      alt={booking.listing.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/listings/${booking.listing._id}`} className="font-semibold hover:underline">
                          {booking.listing.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {booking.listing.location}, {booking.listing.country}
                        </p>
                      </div>
                      <BookingStatusBadge status={booking.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>
                        {new Date(booking.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                        {new Date(booking.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span>{booking.guests} guest{booking.guests > 1 ? "s" : ""}</span>
                      <span>Hosted by {booking.listing.owner?.username ? `@${booking.listing.owner.username}` : "Wanderlust Partner"}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="font-semibold">₹{booking.totalPrice.toLocaleString("en-IN")}</p>
                      {booking.status === "Confirmed" || booking.status === "Pending" ? (
                        <CancelBookingButton bookingId={booking._id.toString()} />
                      ) : null}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 text-sm text-muted-foreground">
                  This listing has been removed by its host.
                  <div className="mt-1">
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
