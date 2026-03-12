"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { subscribeToAuth } from "@/services/authService";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";

export default function Navbar() {
  const { items, isLoading } = useCart();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-40 bg-system-bg/95 backdrop-blur-md border-b border-system-border shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-system-accent to-transparent opacity-50"></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex flex-shrink-0 items-center group">
              <span className="text-2xl font-orbitron font-extrabold text-system-text tracking-widest uppercase transition-all group-hover:text-system-accent group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                SYSTEM<span className="text-system-accent">_SHOP</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/cart" className="relative p-2 font-orbitron text-system-muted hover:text-system-accent transition-colors flex items-center space-x-2 group">
              <span className="hidden sm:inline uppercase text-xs tracking-widest font-bold">Inventory</span>
              <svg className="w-5 h-5 drop-shadow-[0_0_2px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {!isLoading && itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-orbitron font-bold text-black transform translate-x-1/4 -translate-y-1/4 bg-system-accent border border-system-border shadow-system-glow rounded-sm">
                  {itemCount}
                </span>
              )}
            </Link>
            
            <div className="h-6 w-px bg-system-border/50"></div>

            {user ? (
              <>
                <Link href="/dashboard" className="font-orbitron text-xs tracking-widest font-bold text-system-muted hover:text-system-accent uppercase transition-colors">
                  Command
                </Link>
                <Link href="/profile" className="font-orbitron text-xs tracking-widest font-bold text-system-muted hover:text-system-accent uppercase transition-colors">
                  Status
                </Link>
              </>
            ) : (
              <Link href="/login" className="font-orbitron text-xs tracking-widest font-bold text-system-muted hover:text-system-accent uppercase transition-colors">
                Connect
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
