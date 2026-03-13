"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { subscribeToAuth, getUserProfile } from "@/services/authService";
import { User as FirebaseUser } from "firebase/auth";
import { User as UserProfile } from "@/types";
import OnboardingFlow from "@/components/OnboardingFlow";
import DashboardSidebar from "@/components/DashboardSidebar";
import CelestialOrb from "@/components/CelestialOrb";
import { useLoader } from "@/contexts/LoaderContext";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setIsLoading } = useLoader();

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToAuth(async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        setIsLoading(false);
      } else {
        setUser(currentUser);
        const userProfile = await getUserProfile(currentUser.uid);
        setProfile(userProfile);
        setIsLoading(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, setIsLoading]);

  if (loading) {
    return null;
  }

  if (!user) return null;

  if (profile && !profile.onboarded) {
    return (
      <OnboardingFlow 
        user={profile} 
        onComplete={(updated) => {
          setProfile(updated);
          router.push("/dashboard");
        }} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-system-bg">
      <DashboardSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <main className={`flex-1 flex flex-col ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'} transition-all duration-300`}>
        {children}
      </main>
      <CelestialOrb />
    </div>
  );
}
