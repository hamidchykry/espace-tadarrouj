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
  visiblePages: Record<string, boolean>;
  announcements: { id: string; title: string; content: string; date: string }[];
}

export const TRAINER_PAGE_KEYS = [
  "trainer_show_attendance",
  "trainer_show_history",
  "trainer_show_students",
  "trainer_show_stats",
  "trainer_show_profile",
  "trainer_show_announcements",
];

export const TRAINER_DEFAULT_PAGES: Record<string, boolean> = Object.fromEntries(
  TRAINER_PAGE_KEYS.map((k) => [k, true])
);

const TrainerContext = createContext<TrainerContextType>({
  trainer: null,
  loading: true,
  logout: () => {},
  visiblePages: TRAINER_DEFAULT_PAGES,
  announcements: [],
});

export function useTrainer() {
  return useContext(TrainerContext);
}

export function TrainerProvider({ children }: { children: React.ReactNode }) {
  const [trainer, setTrainer] = useState<TrainerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [visiblePages, setVisiblePages] = useState<Record<string, boolean>>(TRAINER_DEFAULT_PAGES);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string; date: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) throw new Error("Not authenticated");
        const data = await meRes.json();
        const user = data.user;
        if (user.role !== "TRAINER") {
          throw new Error("Not a trainer");
        }

        if (cancelled) return;
        setTrainer(user);

        const settings = data.trainerSettings || {};
        const next = { ...TRAINER_DEFAULT_PAGES };
        TRAINER_PAGE_KEYS.forEach((k) => {
          if (settings[k] !== undefined) next[k] = settings[k] === "true";
        });
        setVisiblePages(next);

        if (settings.announcements) {
          try {
            setAnnouncements(JSON.parse(settings.announcements));
          } catch {
            setAnnouncements([]);
          }
        }
      } catch {
        if (!cancelled) router.push("/trainer-login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [router]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout");
    router.push("/trainer-login");
  }, [router]);

  return (
    <TrainerContext.Provider value={{ trainer, loading, logout, visiblePages, announcements }}>
      {children}
    </TrainerContext.Provider>
  );
}
