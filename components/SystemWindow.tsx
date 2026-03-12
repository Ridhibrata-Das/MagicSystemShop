import React, { ReactNode } from 'react';

interface SystemWindowProps {
  title: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  footer?: ReactNode;
}

export default function SystemWindow({ title, children, className = '', headerAction, footer }: SystemWindowProps) {
  return (
    <div className={`bg-system-bg backdrop-blur-md border border-system-border rounded-sm shadow-system-glow overflow-hidden relative \${className}`}>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-system-accent"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-system-accent"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-system-accent"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-system-accent"></div>
      
      {/* Header */}
      <div className="bg-black/40 border-b border-system-border/50 px-4 py-3 flex justify-between items-center relative">
        <h2 className="font-orbitron text-system-accent text-lg tracking-widest uppercase filter drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]">
          {title}
        </h2>
        {headerAction && <div>{headerAction}</div>}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 text-system-text font-rajdhani">
        {children}
      </div>
      
      {/* Optional Footer */}
      {footer && (
        <div className="bg-black/30 border-t border-system-border/30 px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}
