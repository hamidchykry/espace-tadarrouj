"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TRAINER_PAGE_KEYS, useTrainer } from "@/lib/trainer-context";

const HREF_BY_KEY: Record<string, string> = {
  trainer_show_attendance: "/trainer/attendance",
  trainer_show_history: "/trainer/history",
  trainer_show_students: "/trainer/students",
  trainer_show_stats: "/trainer/stats",
  trainer_show_announcements: "/trainer/announcements",
  trainer_show_profile: "/trainer/profile",
};

export default function TrainerHome() {
  const router = useRouter();
  const { visiblePages, loading } = useTrainer();

  useEffect(() => {
    if (loading) return;
    const first = TRAINER_PAGE_KEYS.find((k) => visiblePages[k] !== false);
    router.replace(first ? HREF_BY_KEY[first] : "/trainer-login");
  }, [loading, visiblePages, router]);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground mt-4">جاري التوجيه...</p>
      </div>
    </div>
  );
}
