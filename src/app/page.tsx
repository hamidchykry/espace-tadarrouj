"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Loader2, Shield, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type Role = "admin" | "trainer";

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/75 to-slate-900/85" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 mb-4 shadow-lg">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            مسالك التدرج المهني
          </h1>
          <p className="text-blue-200 mt-2 text-sm">
            بوجدور — إدارة التكوين المهني
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          <div className="flex bg-white/10 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setRole("admin"); setEmail(""); setPassword(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === "admin"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Shield className="h-4 w-4" />
              الإدارة
            </button>
            <button
              type="button"
              onClick={() => { setRole("trainer"); setEmail(""); setPassword(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === "trainer"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <User className="h-4 w-4" />
              المؤطر
            </button>
          </div>

          <h2 className="text-lg font-bold mb-5 text-center text-white">
            {role === "admin" ? "دخول الإدارة" : "دخول المؤطر"}
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                placeholder={role === "admin" ? "admin@boujdour.ma" : "it@boujdour.ma"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/15 border-white/25 text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/30 h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100">
                كلمة المرور
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/15 border-white/25 text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/30 h-12 pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-white text-slate-900 hover:bg-blue-50 font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                "دخول"
              )}
            </Button>
          </form>

          <div className="mt-5 p-3 bg-white/8 rounded-lg text-center border border-white/10">
            <p className="text-blue-200 text-xs">
              {role === "admin"
                ? "admin@boujdour.ma / admin123"
                : "it@boujdour.ma / admin123"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="flex flex-col items-center gap-1 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15">
            <div className="text-lg font-bold text-white">113</div>
            <div className="text-[10px] text-blue-200">متدرب</div>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15">
            <div className="text-lg font-bold text-white">4</div>
            <div className="text-[10px] text-blue-200">ورشات</div>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15">
            <div className="text-lg font-bold text-white">4</div>
            <div className="text-[10px] text-blue-200">أفواج</div>
          </div>
        </div>

        <p className="text-center text-blue-300/50 text-xs mt-6">
          © 2026 مسالك التدرج المهني — بوجدور
        </p>
      </div>
    </div>
  );
}
