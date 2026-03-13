"use client";

import { useEffect } from "react";
import { useLoader } from "@/contexts/LoaderContext";

export default function LoadingTrigger() {
  const { setIsLoading } = useLoader();

  useEffect(() => {
    setIsLoading(true);
    return () => setIsLoading(false);
  }, [setIsLoading]);

  return null;
}
