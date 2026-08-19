import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/wishlist-button";

export type ListingCardData = {
  _id: string;
  title: string;
  price: number;
  location: string;
  country: string;
  category: string;
  image: { url: string; filename: string };
};

export function ListingCard({ listing, isSaved }: { listing: ListingCardData; isSaved: boolean }) {
  return (
    <Link href={`/listings/${listing._id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        <Image
          src={listing.image.url}
          alt={listing.title}
          fill
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3">{listing.category}</Badge>
        <div className="absolute right-3 top-3">
          <WishlistButton listingId={listing._id} initialSaved={isSaved} />
        </div>
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="truncate font-semibold">{listing.title}</p>
        <p className="truncate text-sm text-muted-foreground">
          {listing.location}, {listing.country}
        </p>
        <p className="text-sm">
          <span className="font-semibold">₹{listing.price.toLocaleString("en-IN")}</span>{" "}
          <span className="text-muted-foreground">/ night</span>
        </p>
      </div>
    </Link>
  );
}
