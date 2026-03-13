"use client";

import React, { useState, useEffect, useRef } from 'react';

const ONE_LINERS = [
  "Analyzing the developer's questionable life choices...",
  "Trying to understand why this deprecated library is still here...",
  "Negotiating with the database. It's being stubborn.",
  "Convincing the API that the request is totally valid.",
  "Debugging something that worked perfectly five minutes ago.",
  "Calculating how many console.logs are currently in production...",
  "Attempting to align frontend expectations with backend reality.",
  "Searching for the missing semicolon that broke everything.",
  "Refactoring code that nobody remembers writing.",
  "Simulating intelligence while the server catches up."
];

const THOUGHT_STREAMS = [
  ["> Parsing request...", "> Wait... what is this variable name?", "> Okay... continuing anyway."],
  ["> Checking database...", "> Database says “maybe”.", "> Interpreting that as yes."],
  ["> Reading code comments...", "> Developer wrote: “fix later”.", "> It was never fixed."],
  ["> Evaluating API response...", "> Response format unexpected.", "> Adjusting expectations."],
  ["> Inspecting frontend logic...", "> This component has re-rendered 14 times.", "> I admire the persistence."],
  ["> Attempting optimization...", "> Actually making it slower.", "> Rolling back."],
  ["> Searching StackOverflow internally...", "> Top answer: “Have you tried restarting?”", "> I guess I'll try that."],
  ["> Comparing product attributes...", "> One of these descriptions was clearly written by AI.", "> Irony noted."],
  ["> Aligning design system...", "> Pixel off by 1.", "> Nobody will notice."],
  ["> Finishing computation...", "> Pretending this took deep reasoning.", "> Done."]
];

interface TooHonestLoaderProps {
  isVisible: boolean;
}

export default function TooHonestLoader({ isVisible }: TooHonestLoaderProps) {
  const [actuallyVisible, setActuallyVisible] = useState(false);
  const [showThoughts, setShowThoughts] = useState(false);
  const [oneLinerIndex, setOneLinerIndex] = useState(0);
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const [displayText, setDisplayText] = useState<string[]>([]);
  const [charIndex, setCharIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  
  const startTimeRef = useRef<number | null>(null);
  const minDuration = 2500;

  useEffect(() => {
    if (isVisible) {
      startTimeRef.current = Date.now();
      setActuallyVisible(true);
      
      // Always pick a random one-liner
      const olIndex = Math.floor(Math.random() * 10);
      setOneLinerIndex(olIndex);

      // Randomly decide to also show thoughts
      const showT = Math.random() > 0.5;
      setShowThoughts(showT);
      const tIndex = Math.floor(Math.random() * 10);
      setThoughtIndex(tIndex);
      
      // Reset typing state - first line is always the one-liner
      setDisplayText([""]);
      setCharIndex(0);
      setLineIndex(0);
    } else if (actuallyVisible) {
      const now = Date.now();
      const elapsed = startTimeRef.current ? now - startTimeRef.current : 0;
      const remaining = Math.max(0, minDuration - elapsed);
      
      const timer = setTimeout(() => {
        setActuallyVisible(false);
      }, remaining);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, actuallyVisible]);

  useEffect(() => {
    if (!actuallyVisible) return;

    // Combine one-liner with thoughts if enabled
    const oneLiner = ONE_LINERS[oneLinerIndex];
    const thoughts = showThoughts ? THOUGHT_STREAMS[thoughtIndex] : [];
    const fullContent = [oneLiner, ...thoughts];

    if (lineIndex < fullContent.length) {
      const currentLine = fullContent[lineIndex];
      if (charIndex < currentLine.length) {
        const charTimer = setTimeout(() => {
          setDisplayText(prev => {
            const next = [...prev];
            next[lineIndex] = currentLine.substring(0, charIndex + 1);
            return next;
          });
          setCharIndex(prev => prev + 1);
        }, 15 + Math.random() * 10); // Slightly faster typing for longer content
        return () => clearTimeout(charTimer);
      } else if (lineIndex < fullContent.length - 1) {
        // Prepare next line
        setDisplayText(prev => [...prev, ""]);
        const lineTimer = setTimeout(() => {
          setLineIndex(prev => prev + 1);
          setCharIndex(0);
        }, lineIndex === 0 ? 800 : 500); // Longer pause after the one-liner
        return () => clearTimeout(lineTimer);
      }
    }
  }, [actuallyVisible, oneLinerIndex, showThoughts, thoughtIndex, lineIndex, charIndex]);

  if (!actuallyVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in-up">
      <div className="bg-system-bg border border-system-accent shadow-system-glow-hover p-8 rounded-sm max-w-lg w-full mx-4 space-y-8 relative overflow-hidden">
        {/* Corner Decor */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-system-accent"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-system-accent"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-system-accent"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-system-accent"></div>
        
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-scanline opacity-10"></div>
        
        <div className="flex flex-col items-center gap-6">
          {/* Futuristic Spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-2 border-system-accent/20 rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-t-2 border-system-accent rounded-full animate-spin shadow-[0_0_15px_rgba(0,240,255,0.5)]"></div>
            <div className="absolute inset-4 w-8 h-8 border-b-2 border-system-accent rounded-full animate-spin-slow opacity-50"></div>
          </div>
          
          <div className="space-y-4 w-full text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-8 bg-system-accent/30"></div>
              <h3 className="font-orbitron font-black text-system-accent text-[10px] tracking-[0.4em] uppercase">
                AI_Processing_Manifest
              </h3>
              <div className="h-[1px] w-8 bg-system-accent/30"></div>
            </div>
            
            <div className="bg-black/60 border border-white/5 p-6 rounded-sm min-h-[140px] flex flex-col justify-center shadow-inner">
              <div className="space-y-3">
                {displayText.map((line, idx) => (
                  <p 
                    key={idx} 
                    className={`font-mono text-sm leading-relaxed tracking-wider ${
                      idx === 0 
                        ? 'text-system-text font-medium border-b border-system-accent/10 pb-2 mb-2 italic' 
                        : 'text-system-muted text-left pl-2'
                    }`}
                  >
                    {line}
                    {idx === lineIndex && charIndex < (idx === 0 ? ONE_LINERS[oneLinerIndex] : THOUGHT_STREAMS[thoughtIndex][idx-1]).length && (
                      <span className="inline-block w-2 h-4 bg-system-accent ml-1 animate-pulse align-middle"></span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
