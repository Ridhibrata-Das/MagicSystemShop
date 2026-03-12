"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { subscribeToAuth } from "@/services/authService";

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      if (user) {
        router.push("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  return null;
}
