"use client";

import { useLoader } from "@/contexts/LoaderContext";
import TooHonestLoader from "@/components/TooHonestLoader";

export default function GlobalLoader() {
  const { isLoading } = useLoader();
  return <TooHonestLoader isVisible={isLoading} />;
}
