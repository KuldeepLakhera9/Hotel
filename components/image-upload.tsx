"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { getCloudinaryUploadSignature } from "@/lib/actions/cloudinary";

export function ImageUpload({
  initialPreviewUrl,
  onUploaded,
}: {
  initialPreviewUrl?: string;
  onUploaded: (result: { url: string; filename: string }) => void;
}) {
  const [preview, setPreview] = useState<string | undefined>(initialPreviewUrl);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const sig = await getCloudinaryUploadSignature();
      if (!sig.success) {
        toast.error(sig.error);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Upload failed");

      setPreview(data.secure_url);
      onUploaded({ url: data.secure_url, filename: data.public_id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted text-sm text-muted-foreground hover:border-primary">
      {preview ? (
        <div className="relative size-full overflow-hidden rounded-2xl">
          <Image
            src={preview}
            alt="Listing preview"
            fill
            className="object-cover"
            unoptimized={preview.startsWith("blob:")}
          />
        </div>
      ) : (
        <>
          <UploadCloud className="size-8" />
          <span>{uploading ? "Uploading..." : "Click to upload a photo"}</span>
        </>
      )}
      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </label>
  );
}
