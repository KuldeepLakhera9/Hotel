"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Listing } from "@/lib/models/Listing";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { hasPermission } from "@/lib/rbac";
import { logAdminAction } from "@/lib/audit";

type ActionResult = { success: true } | { success: false; error: string };

export async function setListingActive(listingId: string, isActive: boolean): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, "manageListings")) {
    return { success: false, error: "You do not have permission to manage listings" };
  }

  await connectDB();
  const listing = await Listing.findByIdAndUpdate(listingId, { isActive }, { new: true });
  if (!listing) return { success: false, error: "Listing not found" };

  await logAdminAction(session.user.id, isActive ? "LISTING_REACTIVATED" : "LISTING_DEACTIVATED", "Listing", listingId);

  revalidatePath("/admin/listings");
  revalidatePath("/listings");
  revalidatePath(`/listings/${listingId}`);
  return { success: true };
}

export async function adminDeleteListing(listingId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, "manageListings")) {
    return { success: false, error: "You do not have permission to manage listings" };
  }

  await connectDB();
  const listing = await Listing.findById(listingId);
  if (!listing) return { success: false, error: "Listing not found" };

  await deleteCloudinaryAsset(listing.image.filename);
  await Listing.findByIdAndDelete(listingId); // triggers the cascade review-delete hook

  await logAdminAction(session.user.id, "LISTING_DELETED", "Listing", listingId, { title: listing.title });

  revalidatePath("/admin/listings");
  revalidatePath("/listings");
  return { success: true };
}
