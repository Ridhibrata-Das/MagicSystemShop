"use client";

import { useState } from "react";
import SystemWindow from "./SystemWindow";
import { refillCredits, getCurrentUser } from "@/services/authService";
import { useSystemMessage } from "@/contexts/SystemMessageContext";

interface GoldTier {
  gold: number;
  price: number;
  label: string;
}

const GOLD_TIERS: GoldTier[] = [
  { gold: 100, price: 99, label: "Scout Pack" },
  { gold: 500, price: 399, label: "Warrior Cache" },
  { gold: 1000, price: 699, label: "Adventurer Chest" },
  { gold: 2000, price: 1299, label: "Hero Vault" },
  { gold: 5000, price: 2499, label: "King's Treasury" },
  { gold: 10000, price: 4499, label: "Emperor's Archive" },
];

interface GoldRefillModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GoldRefillModal({ onClose, onSuccess }: GoldRefillModalProps) {
  const [loadingTier, setLoadingTier] = useState<number | null>(null);
  const { showMessage } = useSystemMessage();

  const handleRefill = async (tier: GoldTier) => {
    const user = getCurrentUser();
    if (!user) return;

    setLoadingTier(tier.gold);
    
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 1500));

    const { error } = await refillCredits(user.uid, tier.gold);
    
    if (!error) {
      showMessage("Funds Synchronized", `Successfully acquired ${tier.gold} Gold.`, "success");
      if (onSuccess) onSuccess();
      onClose();
    } else {
      showMessage("Transfer Failed", error, "error");
    }
    setLoadingTier(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl transform animate-scale-in">
        <SystemWindow 
          title="REFILL PROTOCOL: INSUFFICIENT FUNDS"
          headerAction={
            <button onClick={onClose} className="text-system-muted hover:text-system-accent transition-colors font-orbitron text-xs uppercase">[ Abort ]</button>
          }
        >
          <div className="p-6">
            <p className="text-center text-sm font-rajdhani text-system-text mb-8 uppercase tracking-[0.2em] opacity-80">
              Select an endowment tier to replenish your registry funds.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GOLD_TIERS.map((tier) => (
                <div 
                  key={tier.gold}
                  className="bg-black/40 border border-system-border/50 rounded-sm p-4 relative group hover:border-system-accent transition-all hover:shadow-system-glow-hover flex flex-col items-center text-center"
                >
                  <div className="absolute top-0 right-0 p-1">
                    <div className="w-1.5 h-1.5 bg-system-accent/30 rounded-full group-hover:bg-system-accent group-hover:animate-pulse shadow-system-glow"></div>
                  </div>

                  <h3 className="text-[10px] font-orbitron font-bold text-system-muted uppercase tracking-widest mb-1 group-hover:text-system-accent transition-colors">
                    {tier.label}
                  </h3>
                  
                  <div className="my-2">
                    <span className="text-2xl font-black text-system-text font-orbitron tracking-tighter">
                      {tier.gold}
                    </span>
                    <span className="text-xs font-bold text-system-accent ml-1 uppercase">G</span>
                  </div>

                  <button
                    disabled={loadingTier !== null}
                    onClick={() => handleRefill(tier)}
                    className="mt-4 w-full bg-system-accent/10 border border-system-accent py-2 text-xs font-orbitron font-bold text-system-accent uppercase tracking-widest hover:bg-system-accent hover:text-black transition-all disabled:opacity-50"
                  >
                    {loadingTier === tier.gold ? "SYNCING..." : `₹${tier.price}`}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-system-border/30 text-center">
               <p className="text-[10px] font-mono text-system-muted uppercase tracking-widest">
                  Secure encrypted transmission via System Link v2.4
               </p>
            </div>
          </div>
        </SystemWindow>
      </div>
    </div>
  );
}
