"use client";

import { useState } from "react";
import { User } from "@/types";
import { updateDoc } from "firebase/firestore";
import { getUserDoc } from "@/services/db";
import SystemWindow from "./SystemWindow";

interface OnboardingFlowProps {
  user: User;
  onComplete: (updatedUser: User) => void;
}

export default function OnboardingFlow({ user, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: "",
    profession: "",
    skills: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(s => s !== "");
      const updatedData = {
        age: parseInt(formData.age) || 0,
        profession: formData.profession,
        skills: skillsArray,
        onboarded: true,
      };

      await updateDoc(getUserDoc(user.uid), updatedData);
      onComplete({ ...user, ...updatedData });
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 py-4 animate-fade-in-up">
            <div className="text-center">
              <h2 className="text-2xl font-orbitron text-system-accent uppercase tracking-widest mb-2">The Awakening</h2>
              <p className="text-system-muted font-rajdhani italic">"The registry requires your essence to categorize your potential."</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-orbitron text-system-muted uppercase tracking-widest mb-1">Temporal Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-black/60 border border-system-border p-3 text-system-text font-mono focus:border-system-accent outline-none"
                  placeholder="Cycles passed..."
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!formData.age}
                className="w-full py-3 bg-system-accent/20 border border-system-accent text-system-accent font-orbitron uppercase tracking-widest hover:bg-system-accent hover:text-black transition-all"
              >
                Proceed to Origin
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 py-4 animate-fade-in-up">
            <div className="text-center">
              <h2 className="text-2xl font-orbitron text-system-accent uppercase tracking-widest mb-2">Defining Origin</h2>
              <p className="text-system-muted font-rajdhani italic">"What is your calling in the material realm?"</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-orbitron text-system-muted uppercase tracking-widest mb-1">Core Profession</label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full bg-black/60 border border-system-border p-3 text-system-text font-mono focus:border-system-accent outline-none"
                  placeholder="Warrior, Mage, Architect..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-system-muted text-system-muted font-orbitron uppercase tracking-widest hover:text-white transition-all"
                >
                  Regress
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.profession}
                  className="flex-1 py-3 bg-system-accent/20 border border-system-accent text-system-accent font-orbitron uppercase tracking-widest hover:bg-system-accent hover:text-black transition-all"
                >
                  Manifest Traits
                </button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 py-4 animate-fade-in-up">
            <div className="text-center">
              <h2 className="text-2xl font-orbitron text-system-accent uppercase tracking-widest mb-2">The Catalyst</h2>
              <p className="text-system-muted font-rajdhani italic">"Enumerate your mystical proficiencies."</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-orbitron text-system-muted uppercase tracking-widest mb-1">Known Skills (Comma Separated)</label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full bg-black/60 border border-system-border p-3 text-system-text font-mono focus:border-system-accent outline-none h-24"
                  placeholder="Swordsmanship, Pyromancy, Coding..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-system-muted text-system-muted font-orbitron uppercase tracking-widest hover:text-white transition-all"
                >
                  Regress
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.skills}
                  className="flex-1 py-3 bg-system-accent/20 border border-system-accent text-system-accent font-orbitron uppercase tracking-widest hover:bg-system-accent hover:text-black transition-all shadow-system-glow"
                >
                  {loading ? "Synchronizing..." : "Complete Awakening"}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md">
        <SystemWindow title="PLAYER INITIALIZATION PROTOCOL">
          <div className="p-4">
            <div className="flex justify-center mb-6">
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1 w-8 rounded-full transition-all \${step >= s ? "bg-system-accent shadow-system-glow" : "bg-system-muted/30"}`}
                  />
                ))}
              </div>
            </div>
            {renderStep()}
          </div>
        </SystemWindow>
      </div>
    </div>
  );
}
