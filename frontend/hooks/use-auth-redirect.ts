"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export function useAuthRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(ROUTES.HOME);
    }
  }, [isLoaded, isSignedIn, router]);

  return { isSignedIn, isLoaded };
}
