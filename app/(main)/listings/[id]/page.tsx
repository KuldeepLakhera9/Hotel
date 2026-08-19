import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Coffee, MapPin, Pencil, Snowflake, Star, Tv, UtensilsCrossed, Waves, Wifi, ParkingCircle, WashingMachine } from "lucide-react";
import { auth } from "@/lib/auth";
import { getListingById } from "@/lib/data/listings";
import { getUserWishlistIds } from "@/lib/data/users";
import { getAverageRating } from "@/lib/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingMapWrapper } from "@/components/listing-map-wrapper";
import { ReviewForm } from "@/components/review-form";
import { BookingWidget } from "@/components/booking-widget";
import { ReviewItem } from "@/components/review-item";
import { WishlistButton } from "@/components/wishlist-button";
import { DeleteListingButton } from "@/components/delete-listing-button";

const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi,
  "Free parking": ParkingCircle,
  "Air conditioning": Snowflake,
  Kitchen: UtensilsCrossed,
  TV: Tv,
  Pool: Waves,
  Washer: WashingMachine,
  "Free breakfast": Coffee,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return { title: "Listing not found — Wanderlust" };
  return {
    title: `${listing.title} — Wanderlust`,
    description: listing.description.slice(0, 160),
    openGraph: { images: [listing.image.url] },
  };
}

export default async function ListingShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [listing, session] = await Promise.all([getListingById(id), auth()]);

  if (!listing) notFound();

  const wishlistIds = session?.user ? await getUserWishlistIds(session.user.id) : [];
  const isOwner = !!(session?.user && listing.owner && listing.owner._id.toString() === session.user.id);
  const averageRating = getAverageRating(listing.reviews);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="secondary" className="mb-2">
            {listing.category}
          </Badge>
          <h1 className="text-2xl font-bold md:text-3xl">{listing.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {listing.location}, {listing.country}
          </p>
        </div>
        {isOwner && (
          <div className="flex shrink-0 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/listings/${id}/edit`}>
                <Pencil className="size-4" /> Edit
              </Link>
            </Button>
            <DeleteListingButton listingId={id} />
          </div>
        )}
      </div>

      <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
        <Image src={listing.image.url} alt={listing.title} fill sizes="100vw" className="object-cover" priority />
        {session?.user && (
          <div className="absolute right-4 top-4">
            <WishlistButton listingId={id} initialSaved={wishlistIds.includes(id)} />
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-2">
          <div>
            <p className="font-semibold">
              Hosted by {listing.owner?.username ? `@${listing.owner.username}` : "a Wanderlust Partner"}
            </p>
            <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{listing.description}</p>
          </div>

          {listing.amenities.length > 0 && (
            <div>
              <h2 className="mb-3 font-semibold">What this place offers</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {listing.amenities.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity];
                  return (
                    <div key={amenity} className="flex items-center gap-2 text-sm">
                      {Icon && <Icon className="size-4 text-primary" />}
                      {amenity}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-3 font-semibold">Where you&apos;ll be</h2>
            <ListingMapWrapper
              markers={[
                {
                  id,
                  lat: listing.geometry.coordinates[1],
                  lng: listing.geometry.coordinates[0],
                  title: listing.title,
                  subtitle: `${listing.location}, ${listing.country}`,
                },
              ]}
            />
          </div>

          <div>
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Star className="size-4 fill-primary text-primary" />
              {averageRating ? `${averageRating} · ` : ""}
              {listing.reviews.length} review{listing.reviews.length === 1 ? "" : "s"}
            </h2>

            {session?.user && (
              <div className="mb-4">
                <ReviewForm listingId={id} />
              </div>
            )}

            <div className="space-y-3">
              {listing.reviews.map((review) => (
                <ReviewItem
                  key={review._id.toString()}
                  listingId={id}
                  reviewId={review._id.toString()}
                  authorUsername={review.author?.username ?? "Wanderlust guest"}
                  rating={review.rating}
                  comment={review.comment}
                  canDelete={!!(session?.user && review.author && review.author._id.toString() === session.user.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-24">
            {session?.user ? (
              <BookingWidget listingId={id} pricePerNight={listing.price} />
            ) : (
              <div className="rounded-2xl border border-border p-5 shadow-sm">
                <p className="text-lg font-semibold">
                  ₹{listing.price.toLocaleString("en-IN")}{" "}
                  <span className="text-sm font-normal text-muted-foreground">/ night</span>
                </p>
                <Button asChild size="lg" className="mt-4 w-full">
                  <Link href={`/login?callbackUrl=/listings/${id}`}>Log in to book</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
