"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Users, BookOpen, ClipboardCheck, Loader2, Shield, User } from "lucide-react";
import { toast } from "sonner";

type Role = "admin" | "trainer";

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = role === "admin" ? "/api/auth/login" : "/api/auth/trainer-login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "خطأ في تسجيل الدخول");
        return;
      }

      toast.success("تم تسجيل الدخول بنجاح");
      if (data.user?.role === "TRAINER" || role === "trainer") {
        router.push("/trainer");
      } else {
        router.push("/dashboard");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="bg-card p-8 rounded-2xl border shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-2">
              <GraduationCap className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-xl font-bold">طلبة التدرج المهني</h1>
                <p className="text-xs text-muted-foreground">بوجدور</p>
              </div>
            </div>

            <div className="flex bg-muted rounded-lg p-1 mb-6 mt-6">
              <button
                type="button"
                onClick={() => { setRole("admin"); setEmail(""); setPassword(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                  role === "admin"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="h-4 w-4" />
                الإدارة
              </button>
              <button
                type="button"
                onClick={() => { setRole("trainer"); setEmail(""); setPassword(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                  role === "trainer"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-4 w-4" />
                المؤطر
              </button>
            </div>

            <h2 className="text-lg font-bold mb-4 text-center">
              {role === "admin" ? "دخول الإدارة" : "دخول المؤطر"}
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">البريد الإلكتروني</label>
                <Input
                  type="email"
                  placeholder={role === "admin" ? "admin@boujdour.ma" : "it@boujdour.ma"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">كلمة المرور</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  "دخول"
                )}
              </Button>
            </form>

            <div className="mt-5 p-3 bg-muted/50 rounded-lg text-sm text-center">
              <p className="text-muted-foreground text-xs">
                {role === "admin"
                  ? "admin@boujdour.ma / admin123"
                  : "it@boujdour.ma / admin123"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="flex flex-col items-center gap-1.5 p-3 bg-card rounded-xl border">
              <Users className="h-5 w-5 text-blue-600" />
              <div className="text-lg font-bold">113</div>
              <div className="text-[10px] text-muted-foreground">متدرب</div>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 bg-card rounded-xl border">
              <BookOpen className="h-5 w-5 text-green-600" />
              <div className="text-lg font-bold">4</div>
              <div className="text-[10px] text-muted-foreground">ورشات</div>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 bg-card rounded-xl border">
              <ClipboardCheck className="h-5 w-5 text-purple-600" />
              <div className="text-lg font-bold">4</div>
              <div className="text-[10px] text-muted-foreground">أفواج</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
