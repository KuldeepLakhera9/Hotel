"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-destructive">Oops</p>
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {process.env.NODE_ENV === "development"
          ? error.message
          : "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
