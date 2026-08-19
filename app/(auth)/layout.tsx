import Link from "next/link";
import { Compass } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 px-4 py-12">
      <Link href="/listings" className="mb-8 flex items-center gap-2 text-lg font-bold text-primary">
        <Compass className="size-6" />
        wanderlust
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-sm">{children}</div>
      <Toaster position="top-center" />
    </div>
  );
}
