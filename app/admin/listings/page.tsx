import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllListingsAdmin } from "@/lib/data/admin";
import { hasPermission } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingActions } from "@/components/admin/listing-actions";

export const metadata: Metadata = { title: "Manage Listings — Wanderlust Admin" };

export default async function AdminListingsPage() {
  const session = await auth();
  const canManage = hasPermission(session?.user?.role, "manageListings");
  const listings = await getAllListingsAdmin();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Listings ({listings.length})</h1>

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              {canManage && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing._id.toString()} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image src={listing.image.url} alt={listing.title} fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/listings/${listing._id}`} className="font-medium hover:underline">
                        {listing.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {listing.location}, {listing.country}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{listing.owner?.username ? `@${listing.owner.username}` : "Deleted user"}</td>
                <td className="px-4 py-3">₹{listing.price.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <Badge variant={listing.isActive ? "success" : "secondary"}>
                    {listing.isActive ? "Active" : "Deactivated"}
                  </Badge>
                </td>
                {canManage && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/listings/${listing._id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <ListingActions listingId={listing._id.toString()} isActive={listing.isActive} />
                    </div>
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
