import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Pencil, Star } from "lucide-react";
import { auth } from "@/lib/auth";
import { getHostDashboardData } from "@/lib/data/bookings";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Host Dashboard — Wanderlust" };

export default async function HostDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/host/dashboard");

  const { myListings, hostBookings, totalRevenue, totalStays, totalBookings, hostRating } =
    await getHostDashboardData(session.user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <h1 className="mb-6 text-2xl font-bold">Host Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} />
        <MetricCard label="Active Properties" value={String(totalStays)} />
        <MetricCard label="Total Bookings" value={String(totalBookings)} />
        <MetricCard
          label="Host Rating"
          value={hostRating ? `${hostRating} / 5` : "No reviews yet"}
          icon={hostRating ? <Star className="size-4 fill-primary text-primary" /> : undefined}
        />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Reservation Requests</h2>
      {hostBookings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No bookings yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {hostBookings.map((b) => (
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
                  <td className="px-4 py-3">{b.guests}</td>
                  <td className="px-4 py-3">₹{b.totalPrice.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <BookingStatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mb-3 mt-8 text-lg font-semibold">Your Listings</h2>
      {myListings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          You haven&apos;t listed any properties yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myListings.map((listing) => (
            <div key={listing._id.toString()} className="overflow-hidden rounded-2xl border border-border">
              <div className="relative aspect-video bg-muted">
                <Image src={listing.image.url} alt={listing.title} fill sizes="33vw" className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{listing.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {listing.location}, {listing.country}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/listings/${listing._id}/edit`}>
                    <Pencil className="size-4" /> Edit
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xl font-bold">
          {icon}
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
