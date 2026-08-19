"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { listingSchema, type ListingInput } from "@/lib/validations/listing";
import { createListing, updateListing } from "@/lib/actions/listing";
import { LISTING_CATEGORIES, AMENITY_OPTIONS } from "@/lib/constants/listing";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";

export function ListingForm({
  listingId,
  defaultValues,
}: {
  listingId?: string;
  defaultValues?: Partial<ListingInput> & { imageUrl?: string };
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      country: "",
      price: 0,
      category: "Trending",
      amenities: [],
      ...defaultValues,
    },
  });

  const amenities = watch("amenities") ?? [];

  function onSubmit(data: ListingInput) {
    startTransition(async () => {
      const result = listingId ? await updateListing(listingId, data) : await createListing(data);
      if (result && !result.success) {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <ImageUpload
        initialPreviewUrl={defaultValues?.imageUrl}
        onUploaded={({ url, filename }) => {
          setValue("imageUrl", url);
          setValue("imageFilename", filename);
        }}
      />
      {!listingId && <p className="text-xs text-muted-foreground">Optional — a placeholder photo is used if you skip this.</p>}

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} className="mt-1" />
        {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} className="mt-1" />
        {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register("location")} className="mt-1" />
          {errors.location && <p className="mt-1 text-xs text-destructive">{errors.location.message}</p>}
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register("country")} className="mt-1" />
          {errors.country && <p className="mt-1 text-xs text-destructive">{errors.country.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="price">Price per night (₹)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step="1"
            {...register("price", { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select id="category" className="mt-1" value={field.value} onChange={field.onChange}>
                {LISTING_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            )}
          />
        </div>
      </div>

      <div>
        <Label>Amenities</Label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {AMENITY_OPTIONS.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={amenities.includes(amenity)}
                onChange={(e) => {
                  setValue(
                    "amenities",
                    e.target.checked ? [...amenities, amenity] : amenities.filter((a) => a !== amenity)
                  );
                }}
              />
              {amenity}
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isPending} size="lg">
        {isPending ? "Saving..." : listingId ? "Save changes" : "Create listing"}
      </Button>
    </form>
  );
}
