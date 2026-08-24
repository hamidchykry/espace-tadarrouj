"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ClipboardCheck,
  Clock,
  Users,
  BarChart3,
  User,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TrainerProvider, useTrainer } from "@/lib/trainer-context";

const WORKSHOP_NAMES: Record<string, string> = {
  it: "المعلوميات",
  accounting: "المحاسبة",
  "labor-law": "قانون الشغل",
  tailoring: "الخياطة التقليدية",
};

const WORKSHOP_ICONS: Record<string, string> = {
  it: "💻",
  accounting: "📊",
  "labor-law": "⚖️",
  tailoring: "🧵",
};

function TrainerSidebar({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const { trainer } = useTrainer();
  const pathname = usePathname();
  const workshopName = WORKSHOP_NAMES[trainer?.workshopId || ""] || "ورشة";
  const workshopIcon = WORKSHOP_ICONS[trainer?.workshopId || ""] || "📚";

  const navigation = [
    { name: "لوحة التحكم", href: "/trainer", icon: BarChart3, chip: "bg-blue-100 text-blue-600", active: "bg-gradient-to-l from-blue-600 to-blue-500 shadow-md shadow-blue-500/30" },
    { name: "تسجيل الحضور", href: "/trainer/attendance", icon: ClipboardCheck, chip: "bg-green-100 text-green-600", active: "bg-gradient-to-l from-green-600 to-green-500 shadow-md shadow-green-500/30" },
    { name: "سجل الحضور", href: "/trainer/history", icon: Clock, chip: "bg-amber-100 text-amber-600", active: "bg-gradient-to-l from-amber-500 to-amber-400 shadow-md shadow-amber-500/30" },
    { name: "قائمة الطلبة", href: "/trainer/students", icon: Users, chip: "bg-purple-100 text-purple-600", active: "bg-gradient-to-l from-purple-600 to-purple-500 shadow-md shadow-purple-500/30" },
    { name: "الإحصائيات", href: "/trainer/stats", icon: BarChart3, chip: "bg-indigo-100 text-indigo-600", active: "bg-gradient-to-l from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/30" },
    { name: "الملف الشخصي", href: "/trainer/profile", icon: User, chip: "bg-slate-200 text-slate-600", active: "bg-gradient-to-l from-slate-600 to-slate-500 shadow-md shadow-slate-500/30" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg">
              {workshopIcon}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">{workshopName}</h2>
              <p className="text-white/70 text-xs">طلبة التدرج المهني</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{trainer?.name || "..."}</p>
            <p className="text-xs text-muted-foreground truncate">{trainer?.email || ""}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? item.active + " text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isActive ? "bg-white/25" : item.chip
                )}
              >
                <item.icon className="h-4 w-4" />
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

function TrainerLayoutInner({ children }: { children: React.ReactNode }) {
  const { loading, logout } = useTrainer();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-primary/10 via-background to-background">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              className="fixed top-4 right-4 z-40 md:hidden"
              size="icon"
            />
          }
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="right" className="w-72 p-0">
          <TrainerSidebar onLogout={logout} />
        </SheetContent>
      </Sheet>

      <div className="hidden w-72 md:block bg-card border-l">
        <TrainerSidebar onLogout={logout} />
      </div>

      <div className="flex-1 overflow-auto">
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TrainerProvider>
      <TrainerLayoutInner>{children}</TrainerLayoutInner>
    </TrainerProvider>
  );
}
