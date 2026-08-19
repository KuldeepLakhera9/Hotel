"use server";

import { auth } from "@/lib/auth";
import { cloudinary, CLOUDINARY_FOLDER } from "@/lib/cloudinary";

type SignatureResult =
  | { success: true; signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string }
  | { success: false; error: string };

/**
 * Generates a signed-upload payload so the browser can POST the image file
 * directly to Cloudinary's API — the api_secret never leaves the server,
 * and the file bytes never have to pass through a Server Action/Route
 * Handler body (which have request size limits on Vercel).
 */
export async function getCloudinaryUploadSignature(): Promise<SignatureResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "You must be logged in to upload images" };
  }

  const cloudName = process.env.CLOUD_NAME;
  const apiKey = process.env.CLOUD_API_KEY;
  const apiSecret = process.env.CLOUD_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return { success: false, error: "Image upload is not configured" };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { folder: CLOUDINARY_FOLDER, timestamp },
    apiSecret
  );

  return { success: true, signature, timestamp, apiKey, cloudName, folder: CLOUDINARY_FOLDER };
}
