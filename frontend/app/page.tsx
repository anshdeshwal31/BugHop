"use client";

import { useEffect } from "react";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex gap-4">
        <SignInButton>
          <Button variant="outline" size="lg">
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton>
          <Button variant="default" size="lg">
            Sign Up
          </Button>
        </SignUpButton>
      </div>
    </div>
  );
}
