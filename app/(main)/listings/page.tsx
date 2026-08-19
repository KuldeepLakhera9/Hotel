import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getListings } from "@/lib/data/listings";
import { getUserWishlistIds } from "@/lib/data/users";
import { LISTING_CATEGORIES } from "@/lib/constants/listing";
import { ListingCard, type ListingCardData } from "@/components/listing-card";
import { ListingsMapToggle } from "@/components/listings-map-toggle";
import { cn } from "@/lib/utils";
import type { MapMarker } from "@/components/listing-map";

export const metadata: Metadata = {
  title: "Listings — Wanderlust",
  description: "Browse stays on Wanderlust.",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const [session, listings] = await Promise.all([auth(), getListings({ category, query: q })]);

  const wishlistIds = session?.user ? await getUserWishlistIds(session.user.id) : [];
  const wishlistSet = new Set(wishlistIds);

  const markers: MapMarker[] = listings.map((l) => ({
    id: l._id.toString(),
    lat: l.geometry.coordinates[1],
    lng: l.geometry.coordinates[0],
    title: l.title,
    subtitle: `${l.location}, ${l.country}`,
    href: `/listings/${l._id}`,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-4 flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
        <Link
          href="/listings"
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium",
            !category ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary"
          )}
        >
          All
        </Link>
        {LISTING_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/listings?category=${encodeURIComponent(cat)}`}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium",
              category === cat ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary"
            )}
          >
            {cat}
          </Link>
        ))}
        {(category || q) && (
          <Link href="/listings" className="shrink-0 text-sm font-medium text-primary underline">
            Clear filters
          </Link>
        )}
      </div>

      <ListingsMapToggle markers={markers} />

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
          <p className="text-lg font-semibold text-foreground">No stays found</p>
          <p className="mt-1 text-sm">Try a different search or clear your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id.toString()}
              listing={toCardData(listing)}
              isSaved={wishlistSet.has(listing._id.toString())}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function toCardData(listing: Awaited<ReturnType<typeof getListings>>[number]): ListingCardData {
  return {
    _id: listing._id.toString(),
    title: listing.title,
    price: listing.price,
    location: listing.location,
    country: listing.country,
    category: listing.category,
    image: listing.image,
  };
}
