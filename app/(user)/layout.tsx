"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { subscribeToAuth, getUserProfile } from "@/services/authService";
import { User as FirebaseUser } from "firebase/auth";
import { User as UserProfile } from "@/types";
import OnboardingFlow from "@/components/OnboardingFlow";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        const userProfile = await getUserProfile(currentUser.uid);
        setProfile(userProfile);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-system-accent"></div>
      </div>
    );
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
    </div>
  );
}
