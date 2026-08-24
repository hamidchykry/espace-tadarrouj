"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  Menu,
  LogOut,
  Settings,
  ArrowLeftRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

const navigation = [
  {
    name: "لوحة القيادة",
    href: "/dashboard",
    icon: LayoutDashboard,
    chip: "bg-blue-100 text-blue-600",
    active: "bg-blue-600 text-white shadow-sm shadow-blue-600/30",
  },
  {
    name: "إدارة الطلبة",
    href: "/dashboard/students",
    icon: Users,
    chip: "bg-green-100 text-green-600",
    active: "bg-green-600 text-white shadow-sm shadow-green-600/30",
  },
  {
    name: "إدارة الأفواج",
    href: "/dashboard/cohorts",
    icon: ArrowLeftRight,
    chip: "bg-teal-100 text-teal-600",
    active: "bg-teal-600 text-white shadow-sm shadow-teal-600/30",
  },
  {
    name: "الحضور والغياب",
    href: "/dashboard/attendance",
    icon: ClipboardCheck,
    chip: "bg-amber-100 text-amber-600",
    active: "bg-amber-500 text-white shadow-sm shadow-amber-500/30",
  },
  {
    name: "التقييم والنقاط",
    href: "/dashboard/grades",
    icon: GraduationCap,
    chip: "bg-purple-100 text-purple-600",
    active: "bg-purple-600 text-white shadow-sm shadow-purple-600/30",
  },
  {
    name: "التقارير",
    href: "/dashboard/reports",
    icon: BarChart3,
    chip: "bg-indigo-100 text-indigo-600",
    active: "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30",
  },
  {
    name: "الإعدادات",
    href: "/dashboard/settings",
    icon: Settings,
    chip: "bg-slate-200 text-slate-600",
    active: "bg-slate-600 text-white shadow-sm shadow-slate-600/30",
  },
];

function Sidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col border-l bg-muted/40">
      {/* Brand */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-3 font-bold text-lg">
          <div className="p-2 bg-primary rounded-lg">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div>طلبة التدرج المهني</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? item.active
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

      {/* Footer */}
      <div className="border-t p-3">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => {
        if (r.status === 401) throw new Error("UNAUTHORIZED");
        return r.json();
      })
      .then((data) => {
        if (!cancelled && (data.user?.role === "TRAINER" || !data.user)) {
          throw new Error("UNAUTHORIZED");
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("يرجى تسجيل الدخول أولاً");
          router.replace("/");
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => { cancelled = true; };
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("تم تسجيل الخروج");
    router.replace("/");
  };

  if (checking) {
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
    <div className="flex h-screen">
      {/* Mobile sidebar */}
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
          <Sidebar onLogout={handleLogout} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden w-64 md:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
