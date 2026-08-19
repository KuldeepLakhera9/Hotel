import { z } from "zod";
import { LISTING_CATEGORIES } from "@/lib/constants/listing";

export const listingSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description is too long"),
  location: z.string().min(1, "Location is required"),
  country: z.string().min(1, "Country is required"),
  price: z.number().min(0, "Price must be a positive number"),
  category: z.enum(LISTING_CATEGORIES),
  amenities: z.array(z.string()),
  // Optional: create falls back to a placeholder image when omitted, update
  // keeps the existing image — matching the legacy app's behavior.
  imageUrl: z.string().optional(),
  imageFilename: z.string().optional(),
});

export type ListingInput = z.infer<typeof listingSchema>;
