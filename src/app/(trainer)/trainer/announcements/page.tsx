"use client";

import { Megaphone, Calendar } from "lucide-react";
import { useTrainer } from "@/lib/trainer-context";

export default function TrainerAnnouncementsPage() {
  const { announcements, loading } = useTrainer();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-primary" />
          الإعلانات
        </h1>
        <p className="text-muted-foreground mt-1">
          إعلانات إدارة المركز
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border rounded-xl bg-card">
          <Megaphone className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">لا توجد إعلانات حالياً</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="p-5 border rounded-xl bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                  {a.title}
                </h2>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  <Calendar className="h-3.5 w-3.5" />
                  {a.date}
                </span>
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{a.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
