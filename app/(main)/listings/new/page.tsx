import type { Metadata } from "next";
import { ListingForm } from "@/components/listing-form";

export const metadata: Metadata = { title: "List your home — Wanderlust" };

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <h1 className="mb-6 text-2xl font-bold">Wanderlust your home</h1>
      <ListingForm />
    </div>
  );
}
