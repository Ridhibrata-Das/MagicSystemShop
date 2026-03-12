"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/services/authService";
import { getUserOrders } from "@/services/orders";
import { Order } from "@/types";
import { useRouter } from "next/navigation";
import SystemWindow from "@/components/SystemWindow";
import FundsDisplay from "@/components/FundsDisplay";
import BackToDashboard from "@/components/BackToDashboard";

export default function ProfilePage() {
  const user = getCurrentUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.uid) {
      getUserOrders(user.uid).then((res) => {
        setOrders(res);
        setLoadingOrders(false);
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  if (!user) return null; // handled by layout

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full animate-fade-in-up">
      <BackToDashboard />
      <SystemWindow 
        title="PLAYER STATUS"
        headerAction={
          <button
            onClick={handleLogout}
            className="rounded-sm border border-system-error/50 bg-system-error/10 px-3 py-1 text-xs font-orbitron font-bold text-system-error shadow-system-error hover:bg-system-error hover:text-white transition-all uppercase tracking-widest"
          >
            Disconnect
          </button>
        }
      >
        <div className="max-w-3xl mx-auto py-8">
            <div className="bg-black/40 shadow-inner border border-system-border/50 rounded-sm overflow-hidden">
              <div className="px-6 py-4 bg-system-bg/60 border-b border-system-border/50 flex justify-between items-center">
                <h3 className="text-sm font-orbitron font-bold text-system-accent uppercase tracking-[0.2em]">Entity Information</h3>
                <div className="text-[10px] font-mono text-system-success animate-pulse">CONNECTION_ACTIVE</div>
              </div>
              <div className="px-6 py-6 font-rajdhani">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-xs font-orbitron text-system-muted tracking-widest uppercase mb-1">Entity Designation</dt>
                      <dd className="text-2xl font-black text-system-text drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]">{user.displayName || "GUEST_ENTITY"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-orbitron text-system-muted tracking-widest uppercase mb-1">Comm Link</dt>
                      <dd className="text-sm text-system-text">{user.email}</dd>
                    </div>
                     <div>
                      <dt className="text-xs font-orbitron text-system-muted tracking-widest uppercase mb-1">Profession Base</dt>
                      <dd className="text-lg font-bold text-system-accent uppercase font-orbitron tracking-tighter">ARCHITECT</dd>
                    </div>
                  </dl>

                  <div className="space-y-6">
                    <div>
                      <dt className="text-xs font-orbitron text-system-muted tracking-widest uppercase mb-2">Registry Funds</dt>
                      <div className="text-3xl font-orbitron text-system-accent drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                         <FundsDisplay />
                      </div>
                    </div>
                    
                    <div>
                      <dt className="text-xs font-orbitron text-system-muted tracking-widest uppercase mb-2">Entity Evolution</dt>
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-xs text-system-text uppercase">Level 10</span>
                         <span className="text-xs text-system-muted">45% to Next Cycle</span>
                      </div>
                      <div className="w-full bg-black/80 rounded-sm h-1.5 border border-system-border/30 overflow-hidden">
                         <div className="bg-system-accent h-full shadow-system-glow" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-system-border/30">
                   <dt className="text-xs font-orbitron text-system-muted tracking-widest uppercase mb-3">Manifested Skills</dt>
                   <div className="flex flex-wrap gap-2">
                      {["Coding", "Design", "Alchemy"].map(skill => (
                        <span key={skill} className="px-3 py-1 bg-white/5 border border-system-border/50 text-[10px] uppercase font-orbitron text-system-text hover:border-system-accent transition-colors">
                           {skill}
                        </span>
                      ))}
                   </div>
                </div>
              </div>
            </div>
        </div>
      </SystemWindow>
    </div>
  );
}

