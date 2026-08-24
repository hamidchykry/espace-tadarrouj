"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Save,
  Lock,
  Mail,
  Phone,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  workshopId: string | null;
  createdAt: string;
}

const WORKSHOP_NAMES: Record<string, string> = {
  it: "المعلوميات",
  accounting: "المحاسبة",
  "labor-law": "قانون الشغل",
  tailoring: "الخياطة التقليدية",
};

export default function TrainerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  useEffect(() => {
    fetch("/api/trainer/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setPhone(data.phone || "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/trainer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        toast.success("تم حفظ التغييرات بنجاح");
      } else {
        const data = await res.json();
        toast.error(data.error || "خطأ في الحفظ");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      toast.error("أدخل كلمة المرور الجديدة");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/trainer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        toast.success("تم تغيير كلمة المرور بنجاح");
        setNewPassword("");
        setCurrentPassword("");
      } else {
        const data = await res.json();
        toast.error(data.error || "خطأ في التغيير");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <User className="h-7 w-7 text-primary" />
          الملف الشخصي
        </h1>
        <p className="text-muted-foreground mt-1">إدارة معلومات حسابك</p>
      </div>

      {profile && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
          <div className="relative flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-white/80">{profile.email}</p>
              <p className="text-white/60 text-sm mt-1">
                {WORKSHOP_NAMES[profile.workshopId || ""] || "ورشة"}
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            تعديل المعلومات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              الاسم
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              البريد الإلكتروني
            </label>
            <Input value={profile?.email || ""} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              الهاتف
            </label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الهاتف" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              تاريخ الإنشاء
            </label>
            <Input
              value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("ar-MA") : ""}
              disabled
              className="bg-muted"
            />
          </div>
          <Button variant="success" onClick={handleSaveProfile} disabled={saving}>
            {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            حفظ التغييرات
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            تغيير كلمة المرور
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">كلمة المرور الحالية</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الحالية"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">كلمة المرور الجديدة</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الجديدة"
            />
          </div>
          <Button variant="warning" onClick={handleChangePassword} disabled={saving}>
            {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Lock className="ml-2 h-4 w-4" />}
            تغيير كلمة المرور
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
