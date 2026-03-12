"use client";

import SystemWindow from "@/components/SystemWindow";
import BackToDashboard from "@/components/BackToDashboard";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full animate-fade-in-up">
      <BackToDashboard />
      <SystemWindow title="SYSTEM CONFIGURATION">
        <div className="p-8 space-y-8">
          <section className="space-y-4">
             <h3 className="text-sm font-orbitron font-bold text-system-accent uppercase tracking-widest">Interface Preferences</h3>
             <div className="flex items-center justify-between p-4 bg-black/20 border border-system-border/30 rounded-sm">
                <span className="text-sm text-system-text font-rajdhani uppercase tracking-widest">VFX Intensity</span>
                <div className="flex gap-2">
                   {[1, 2, 3].map(i => (
                      <div key={i} className={`w-8 h-2 rounded-full \${i === 3 ? 'bg-system-accent shadow-system-glow' : 'bg-system-muted/30'}`}></div>
                   ))}
                </div>
             </div>
             <div className="flex items-center justify-between p-4 bg-black/20 border border-system-border/30 rounded-sm">
                <span className="text-sm text-system-text font-rajdhani uppercase tracking-widest">Haptic Feedback</span>
                <div className="w-12 h-6 bg-system-accent/20 border border-system-accent rounded-full relative p-1 cursor-pointer">
                   <div className="w-4 h-4 bg-system-accent rounded-full ml-auto shadow-system-glow"></div>
                </div>
             </div>
          </section>

          <section className="space-y-4 opacity-50 cursor-not-allowed">
             <h3 className="text-sm font-orbitron font-bold text-system-muted uppercase tracking-widest">Advanced Protocols (Locked)</h3>
             <div className="p-4 border border-dashed border-system-border/30 text-center">
                <p className="text-[10px] text-system-muted uppercase tracking-widest font-mono">Unlock at Entity Level 50</p>
             </div>
          </section>
        </div>
      </SystemWindow>
    </div>
  );
}
