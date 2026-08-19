import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getListingById } from "@/lib/data/listings";
import { hasPermission } from "@/lib/rbac";
import { ListingForm } from "@/components/listing-form";

export const metadata: Metadata = { title: "Edit listing — Wanderlust" };

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [listing, session] = await Promise.all([getListingById(id), auth()]);

  if (!listing) notFound();
  const isOwner = !!(session?.user && listing.owner && listing.owner._id.toString() === session.user.id);
  const isAdmin = !!(session?.user && hasPermission(session.user.role, "manageListings"));
  if (!isOwner && !isAdmin) {
    redirect(`/listings/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <h1 className="mb-6 text-2xl font-bold">Edit listing</h1>
      <ListingForm
        listingId={id}
        defaultValues={{
          title: listing.title,
          description: listing.description,
          location: listing.location,
          country: listing.country,
          price: listing.price,
          category: listing.category,
          amenities: listing.amenities,
          imageUrl: listing.image.url,
        }}
      />
    </div>
  );
}
