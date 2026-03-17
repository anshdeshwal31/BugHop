"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

//refer to this here : https://nextjs.org/docs/app/getting-started/error-handling

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
      <h2 className="text-xl font-semibold">something went wrong. lmao</h2>
      <p className="text-muted-foreground">
        some unexpected error occured. try again bro
      </p>
      <Button onClick={reset} variant="outline">
        Try Again
      </Button>
    </div>
  );
}
