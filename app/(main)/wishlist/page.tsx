import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { auth } from "@/lib/auth";
import { getWishlistListings } from "@/lib/data/users";
import { ListingCard } from "@/components/listing-card";

export const metadata: Metadata = { title: "Wishlist — Wanderlust" };

export default async function WishlistPage() {
  const session = await auth();
  const listings = session?.user ? await getWishlistListings(session.user.id) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <Heart className="size-6 fill-primary text-primary" /> Saved Wishlist
      </h1>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
          <p className="text-lg font-semibold text-foreground">No saved stays yet</p>
          <p className="mt-1 text-sm">Tap the heart on any listing to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id.toString()}
              listing={{
                _id: listing._id.toString(),
                title: listing.title,
                price: listing.price,
                location: listing.location,
                country: listing.country,
                category: listing.category,
                image: listing.image,
              }}
              isSaved
            />
          ))}
        </div>
      )}
    </div>
  );
}
