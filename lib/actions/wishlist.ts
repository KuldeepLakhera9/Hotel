"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";

type ToggleResult = { success: true; saved: boolean } | { success: false; error: string };

// Server-backed only. The legacy app also had a second, disconnected
// localStorage-based wishlist that drove the heart icons independently of
// this endpoint — the two could visibly disagree. That's dropped; this is
// the single source of truth now.
export async function toggleWishlist(listingId: string): Promise<ToggleResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You must be logged in to save listings" };

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return { success: false, error: "User not found" };

  const index = user.wishlist.findIndex((id) => id.toString() === listingId);
  let saved: boolean;
  if (index === -1) {
    user.wishlist.push(new mongoose.Types.ObjectId(listingId));
    saved = true;
  } else {
    user.wishlist.splice(index, 1);
    saved = false;
  }
  await user.save();

  revalidatePath("/wishlist");
  revalidatePath("/listings");
  return { success: true, saved };
}
