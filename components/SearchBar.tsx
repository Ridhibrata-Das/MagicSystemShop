"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
  onSearch?: (term: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearchTerm) {
        params.set("q", debouncedSearchTerm);
      } else {
        params.delete("q");
      }
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearchTerm, pathname, router, searchParams, onSearch]);

  return (
    <div className="relative flex w-full max-w-lg items-center group">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg className="h-5 w-5 text-system-accent opacity-70 group-focus-within:opacity-100 group-focus-within:animate-pulse-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        className="block w-full rounded-sm border border-system-border bg-black/50 py-2.5 pl-10 pr-3 text-sm font-orbitron text-system-text placeholder-system-muted focus:border-system-accent focus:bg-system-bg focus:outline-none focus:ring-1 focus:ring-system-accent focus:shadow-system-glow transition-all"
        placeholder="Query Item Database..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {/* HUD scanner line effect on focus */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-system-accent transition-all duration-300 group-focus-within:w-full group-focus-within:shadow-[0_0_8px_rgba(0,240,255,1)]"></div>
    </div>
  );
}
