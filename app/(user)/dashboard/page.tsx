"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, getUserProfile } from "@/services/authService";
import { getPersonalizedRecommendations } from "@/services/recommendationService";
import { Product, User } from "@/types";
import SystemWindow from "@/components/SystemWindow";
import ProductCard from "@/components/ProductCard";
import FundsDisplay from "@/components/FundsDisplay";

export default function DashboardPage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      const user = getCurrentUser();
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
          const recs = await getPersonalizedRecommendations(
            userProfile.profession || "",
            userProfile.skills || []
          );
          setRecommendations(recs);
        }
      }
      setLoading(false);
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-system-accent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full animate-fade-in-up">
      <SystemWindow 
        title="CENTRAL COMMAND DASHBOARD"
        headerAction={
          <div className="flex items-center space-x-2 bg-black/50 border border-system-border px-3 py-1 rounded-sm shadow-system-glow">
            <span className="text-xs font-orbitron text-system-muted tracking-widest uppercase">Registry Funds:</span>
            <FundsDisplay />
          </div>
        }
      >
        <div className="p-2 md:p-6 space-y-12">
          {/* Welcome Section */}
          <div className="border-l-4 border-system-accent pl-6 py-2">
            <h1 className="text-3xl font-orbitron font-black text-system-text uppercase tracking-tighter mb-1">
              Welcome, {profile?.displayName || "ENTITY"}
            </h1>
            <p className="text-system-muted font-rajdhani text-lg italic">
              "Personalized archive links established for your designation as a <span className="text-system-accent font-bold uppercase">{profile?.profession}</span>."
            </p>
          </div>

          {/* Recommendations By Category */}
          {Object.entries(recommendations).map(([category, products]) => (
            <section key={category} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-orbitron font-bold text-system-accent uppercase tracking-[0.3em]">
                  {category} <span className="text-system-muted/30 ml-2">SPECIFICS</span>
                </h2>
                <div className="flex-grow h-px bg-gradient-to-r from-system-accent/50 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}

          {Object.keys(recommendations).length === 0 && (
            <div className="text-center py-20 border border-dashed border-system-border/30 rounded-sm">
              <p className="text-system-muted font-orbitron uppercase tracking-widest">No specialized links found for your essence.</p>
            </div>
          )}
        </div>
      </SystemWindow>
      
      <div className="mt-8 text-center">
        <p className="text-[10px] font-mono text-system-muted uppercase tracking-[0.5em]">
          DATA SYNCHRONIZATION COMPLETE // LOCAL TIME: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
