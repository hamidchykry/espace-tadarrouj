"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface TrainerUser {
  id: string;
  name: string;
  email: string;
  role: string;
  workshopId: string | null;
}

interface TrainerContextType {
  trainer: TrainerUser | null;
  loading: boolean;
  logout: () => void;
}

const TrainerContext = createContext<TrainerContextType>({
  trainer: null,
  loading: true,
  logout: () => {},
});

export function useTrainer() {
  return useContext(TrainerContext);
}

export function TrainerProvider({ children }: { children: React.ReactNode }) {
  const [trainer, setTrainer] = useState<TrainerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error("Not authenticated");
        return r.json();
      })
      .then((data) => {
        const user = data.user;
        if (user.role !== "TRAINER") {
          throw new Error("Not a trainer");
        }
        setTrainer(user);
      })
      .catch(() => {
        router.push("/trainer-login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout");
    router.push("/trainer-login");
  }, [router]);

  return (
    <TrainerContext.Provider value={{ trainer, loading, logout }}>
      {children}
    </TrainerContext.Provider>
  );
}
