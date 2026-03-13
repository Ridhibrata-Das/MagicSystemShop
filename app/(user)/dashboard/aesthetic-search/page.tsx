"use client";

import AestheticSearch from "@/components/AestheticSearch";
import SystemWindow from "@/components/SystemWindow";

export default function AestheticSearchPage() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pt-6 pb-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-[1px] bg-system-accent shadow-system-glow"></div>
             <h1 className="text-3xl font-orbitron font-black text-white tracking-[0.3em] uppercase drop-shadow-system-glow">
               Aesthetic_Visual_Search
             </h1>
          </div>
          <p className="text-system-muted font-rajdhani text-sm tracking-widest italic ml-14 opacity-60">
            MANIFESTING_VISUAL_MATCHES_FROM_THE_CELESTIAL_TREASURY
          </p>
        </div>

        <SystemWindow title="VISUAL_CORRELATION_PORTAL" className="min-h-[600px]">
          <AestheticSearch />
        </SystemWindow>
      </div>
    </div>
  );
}
