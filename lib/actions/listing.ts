"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Listing } from "@/lib/models/Listing";
import { User } from "@/lib/models/User";
import { listingSchema, type ListingInput } from "@/lib/validations/listing";
import { geocodeLocation } from "@/lib/geocode";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { hasPermission } from "@/lib/rbac";

const DEFAULT_IMAGE = {
  url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  filename: "default",
};

type ActionError = { success: false; error: string };

export async function createListing(input: ListingInput): Promise<ActionError | void> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "You must be logged in to create a listing" };
  }

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await connectDB();
  const coordinates = await geocodeLocation(parsed.data.location, parsed.data.country);

  const listing = await Listing.create({
    title: parsed.data.title,
    description: parsed.data.description,
    location: parsed.data.location,
    country: parsed.data.country,
    price: parsed.data.price,
    category: parsed.data.category,
    amenities: parsed.data.amenities,
    image:
      parsed.data.imageUrl && parsed.data.imageFilename
        ? { url: parsed.data.imageUrl, filename: parsed.data.imageFilename }
        : DEFAULT_IMAGE,
    geometry: { type: "Point", coordinates },
    owner: session.user.id,
  });

  // Matches the legacy app: there's no separate "become a host" flow —
  // creating a listing is what makes you one.
  if (session.user.role === "USER") {
    await User.findByIdAndUpdate(session.user.id, { role: "HOST" });
  }

  revalidatePath("/listings");
  redirect(`/listings/${listing._id}`);
}

export async function updateListing(id: string, input: ListingInput): Promise<ActionError | void> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "You must be logged in" };
  }

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await connectDB();
  const listing = await Listing.findById(id);
  if (!listing) {
    return { success: false, error: "Listing not found" };
  }
  if (!listing.owner.equals(session.user.id) && !hasPermission(session.user.role, "manageListings")) {
    return { success: false, error: "You are not the owner of this listing" };
  }

  const locationChanged = listing.location !== parsed.data.location || listing.country !== parsed.data.country;
  if (locationChanged) {
    listing.geometry.coordinates = await geocodeLocation(parsed.data.location, parsed.data.country);
  }

  if (parsed.data.imageUrl && parsed.data.imageFilename) {
    await deleteCloudinaryAsset(listing.image.filename);
    listing.image = { url: parsed.data.imageUrl, filename: parsed.data.imageFilename };
  }

  listing.title = parsed.data.title;
  listing.description = parsed.data.description;
  listing.location = parsed.data.location;
  listing.country = parsed.data.country;
  listing.price = parsed.data.price;
  listing.category = parsed.data.category;
  listing.amenities = parsed.data.amenities;
  await listing.save();

  revalidatePath("/listings");
  revalidatePath(`/listings/${id}`);
  redirect(`/listings/${id}`);
}

export async function deleteListing(id: string): Promise<ActionError | void> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "You must be logged in" };
  }

  await connectDB();
  const listing = await Listing.findById(id);
  if (!listing) {
    return { success: false, error: "Listing not found" };
  }
  if (!listing.owner.equals(session.user.id)) {
    return { success: false, error: "You are not the owner of this listing" };
  }

  await deleteCloudinaryAsset(listing.image.filename);
  await Listing.findByIdAndDelete(id); // triggers the cascade review-delete hook

  revalidatePath("/listings");
  redirect("/listings");
}
