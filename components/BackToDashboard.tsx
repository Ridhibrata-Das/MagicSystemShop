"use client";

import Link from "next/link";

export default function BackToDashboard() {
  return (
    <div className="mb-6 flex items-center">
      <Link 
        href="/dashboard" 
        className="group flex items-center gap-2 text-system-muted hover:text-system-accent transition-all font-orbitron text-xs font-bold uppercase tracking-[0.2em]"
      >
        <div className="p-1 rounded-sm border border-system-border bg-black/50 group-hover:border-system-accent group-hover:shadow-system-glow transition-all">
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
}
