"use client";

import { useEffect, useState } from "react";
import { subscribeToAuth } from "@/services/authService";
import { getUserDoc } from "@/services/db";
import { onSnapshot } from "firebase/firestore";

export default function FundsDisplay() {
  const [funds, setFunds] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: () => void = () => {};

    const unsubscribeAuth = subscribeToAuth((user) => {
      if (user) {
        unsubscribeSnapshot = onSnapshot(getUserDoc(user.uid), (doc) => {
          if (doc.exists()) {
            setFunds(doc.data().credits || 0);
          }
          setLoading(false);
        });
      } else {
        setFunds(0);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, []);

  if (loading) return <span className="text-sm font-orbitron font-bold text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)] animate-pulse">... G</span>;

  return (
    <span className="text-sm font-orbitron font-bold text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]">
      {funds.toLocaleString()} G
    </span>
  );
}
