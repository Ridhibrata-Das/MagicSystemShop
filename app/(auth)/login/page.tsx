"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DOMPurify from "dompurify";
import { loginSchema } from "@/schemas/authSchemas";
import { login, loginWithGoogle, subscribeToAuth } from "@/services/authService";
import SystemWindow from "@/components/SystemWindow";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      if (user) {
        router.push("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Sanitize
    const cleanEmail = DOMPurify.sanitize(email);

    // Validate
    const result = loginSchema.safeParse({ email: cleanEmail, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      setLoading(false);
      return;
    }

    // Authenticate
    const { user, error: authError } = await login(result.data);
    if (authError) {
      setError(authError);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);
    const { user, error: authError } = await loginWithGoogle();
    if (authError) {
      setError(authError);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md mx-auto flex-grow flex items-center justify-center animate-fade-in-up py-12 px-4 sm:px-6 lg:px-8">
      <SystemWindow title="SYSTEM LOGIN" className="w-full">
        <h3 className="mb-6 text-center text-sm font-orbitron font-bold text-system-muted tracking-[0.2em] uppercase">Authenticate to access Player Interface</h3>
        
        {error && <div className="mb-4 rounded-sm bg-system-error/20 border border-system-error/50 p-4 text-xs font-orbitron uppercase text-system-error tracking-widest">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-orbitron font-bold text-system-accent uppercase tracking-widest mb-1">Entity Comm Link (Email)</label>
            <div className="mt-1">
              <input
                type="email"
                required
                className="block w-full appearance-none rounded-sm border border-system-border/50 bg-black/50 py-2.5 px-3 font-rajdhani text-system-text placeholder-system-muted focus:border-system-accent focus:bg-system-bg focus:outline-none focus:ring-1 focus:ring-system-accent focus:shadow-system-glow transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-orbitron font-bold text-system-accent uppercase tracking-widest mb-1">Access Cipher (Password)</label>
            <div className="mt-1">
              <input
                type="password"
                required
                className="block w-full appearance-none rounded-sm border border-system-border/50 bg-black/50 py-2.5 px-3 font-rajdhani text-system-text placeholder-system-muted focus:border-system-accent focus:bg-system-bg focus:outline-none focus:ring-1 focus:ring-system-accent focus:shadow-system-glow transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-sm border border-system-accent bg-system-accent/10 py-3 px-4 text-sm font-orbitron font-bold text-system-accent shadow-system-glow transition-all hover:bg-system-accent hover:text-black focus:outline-none focus:ring-1 focus:ring-system-accent disabled:opacity-50 uppercase tracking-widest"
            >
              {loading ? "AUTHENTICATING..." : "INITIATE LOGIN"}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-system-border/30">
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-sm border border-system-border bg-black/50 py-3 px-4 text-sm font-orbitron font-bold text-system-text shadow-sm transition-all hover:border-system-accent hover:text-system-accent hover:shadow-system-glow focus:outline-none disabled:opacity-50 uppercase tracking-widest"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sync via Google
          </button>
        </div>
        
        <div className="mt-6 pt-4 text-center text-sm font-rajdhani">
          <span className="text-system-muted">Unregistered Entity? </span>
          <Link href="/signup" className="font-orbitron font-bold text-system-accent hover:text-white transition-colors">
            Register Here
          </Link>
        </div>
      </SystemWindow>
    </div>
  );
}
