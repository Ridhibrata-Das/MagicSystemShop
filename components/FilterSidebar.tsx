"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

const CATEGORIES = ["Weapons", "Armor", "Potions", "Artifacts", "Materials", "Scrolls"];

export default function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minP") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxP") || "");
  const currentCategory = searchParams.get("category") || "";

  const debouncedMin = useDebounce(minPrice, 500);
  const debouncedMax = useDebounce(maxPrice, 500);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;
    
    if (debouncedMin !== (searchParams.get("minP") || "")) {
      if (debouncedMin) params.set("minP", debouncedMin);
      else params.delete("minP");
      changed = true;
    }
    
    if (debouncedMax !== (searchParams.get("maxP") || "")) {
      if (debouncedMax) params.set("maxP", debouncedMax);
      else params.delete("maxP");
      changed = true;
    }

    if (changed) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedMin, debouncedMax, pathname, router, searchParams]);

  return (
    <div className="w-full shrink-0 flex-col space-y-8 lg:w-64 bg-black/40 border border-system-border/50 p-4 rounded-sm">
      <div>
        <h3 className="mb-4 text-sm font-orbitron font-bold text-system-accent uppercase tracking-[0.2em] border-b border-system-border/50 pb-2">Equipment Class</h3>
        <div className="space-y-2 mt-4">
          <button
            onClick={() => updateFilters("category", "")}
            className={`w-full text-left px-3 py-2 rounded-sm text-sm font-orbitron tracking-wider transition-all border-l-2 \${
              currentCategory === "" 
                ? "bg-system-accent/20 text-system-accent border-system-accent shadow-system-glow" 
                : "text-system-muted hover:text-system-text hover:bg-white/5 border-transparent hover:border-system-border"
            }`}
          >
            [ All Classes ]
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilters("category", cat)}
              className={`w-full text-left px-3 py-2 rounded-sm text-sm font-orbitron tracking-wider transition-all border-l-2 \${
                currentCategory === cat 
                  ? "bg-system-accent/20 text-system-accent border-system-accent shadow-system-glow" 
                  : "text-system-muted hover:text-system-text hover:bg-white/5 border-transparent hover:border-system-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-orbitron font-bold text-system-accent uppercase tracking-[0.2em] border-b border-system-border/50 pb-2">Value Range (G)</h3>
        <div className="flex items-center space-x-2 mt-4">
          <input
            type="number"
            placeholder="Min"
            className="w-full rounded-sm border border-system-border bg-black/50 px-3 py-2 text-sm font-orbitron text-system-text placeholder-system-border focus:border-system-accent focus:outline-none focus:ring-1 focus:ring-system-accent"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="text-system-accent">-</span>
          <input
            type="number"
            placeholder="Max"
            className="w-full rounded-sm border border-system-border bg-black/50 px-3 py-2 text-sm font-orbitron text-system-text placeholder-system-border focus:border-system-accent focus:outline-none focus:ring-1 focus:ring-system-accent"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
