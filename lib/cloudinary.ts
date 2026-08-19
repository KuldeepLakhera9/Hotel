import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

export const CLOUDINARY_FOLDER = "Wanderlust";

export { cloudinary };

// The legacy app never cleaned up replaced/deleted listing images, leaking
// orphaned Cloudinary storage indefinitely. "default" is the filename used
// for the hardcoded Unsplash fallback image, which isn't a real asset.
export async function deleteCloudinaryAsset(publicId: string | undefined) {
  if (!publicId || publicId === "default") return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Failed to delete Cloudinary asset", publicId, err);
  }
}
