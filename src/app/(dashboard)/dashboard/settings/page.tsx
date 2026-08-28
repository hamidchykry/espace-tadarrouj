"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings,
  Save,
  Loader2,
  Building2,
  BookOpen,
  Users,
  Calendar,
  CheckCircle,
  Database,
  Upload,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface SettingsData {
  [key: string]: string;
}

const DEFAULT_SETTINGS: SettingsData = {
  centerName: "طلبة التدرج المهني",
  centerLocation: "بوجدور",
  academicYear: "2025-2026",
  workshop1Name: "المعلوميات",
  workshop1Icon: "💻",
  workshop2Name: "المحاسبة",
  workshop2Icon: "📊",
  workshop3Name: "قانون الشغل",
  workshop3Icon: "⚖️",
  workshop4Name: "الخياطة التقليدية",
  workshop4Icon: "🧵",
  trainer1Name: "",
  trainer2Name: "",
  trainer3Name: "",
  trainer4Name: "",
  totalStudents: "113",
  registrationPrefix: "BD-2026",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) {
        toast.error("خطأ في إنشاء النسخة الاحتياطية");
        return;
      }
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      toast.success("تم إنشاء النسخة الاحتياطية بنجاح");
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestore = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (!confirm("سيتم استعاب نسخة احتياطية واستبدال الطلبة الحاليين. هل أنت متأكد؟")) return;
      setRestoring(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const res = await fetch("/api/backup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const result = await res.json();
          toast.success(`تمت الاستعادة: ${result.students} متدرب`);
        } else {
          const err = await res.json();
          toast.error(err.error || "خطأ في الاستعادة");
        }
      } catch {
        toast.error("ملف غير صالح");
      } finally {
        setRestoring(false);
      }
    };
    input.click();
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        if (!cancelled && res.ok) {
          const data = await res.json();
          setSettings({ ...DEFAULT_SETTINGS, ...data });
        }
      } catch {
        if (!cancelled) toast.error("خطأ في جلب الإعدادات");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        toast.success("تم حفظ الإعدادات بنجاح");
        setHasChanges(false);
      } else {
        toast.error("خطأ في الحفظ");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            الإعدادات
          </h1>
          <p className="text-muted-foreground mt-1">
            إعدادات المركز والورشات والمؤطرين
          </p>
        </div>
        <Button variant="success" onClick={handleSave} disabled={saving || !hasChanges}>
          {saving ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="ml-2 h-4 w-4" />
          )}
          حفظ الإعدادات
        </Button>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-yellow-600" />
          <span className="text-yellow-800">هناك تغييرات غير محفوظة</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Center Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              إعدادات المركز
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم المركز</label>
              <Input
                value={settings.centerName}
                onChange={(e) => updateSetting("centerName", e.target.value)}
                placeholder="اسم المركز"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الموقع</label>
              <Input
                value={settings.centerLocation}
                onChange={(e) => updateSetting("centerLocation", e.target.value)}
                placeholder="المدينة"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">السنة الدراسية</label>
              <Input
                value={settings.academicYear}
                onChange={(e) => updateSetting("academicYear", e.target.value)}
                placeholder="2025-2026"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">بادئة رقم التسجيل</label>
              <Input
                value={settings.registrationPrefix}
                onChange={(e) => updateSetting("registrationPrefix", e.target.value)}
                placeholder="BD-2026"
              />
            </div>
          </CardContent>
        </Card>

        {/* Workshop Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              إعدادات الورشات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium">الورشة {num}</label>
                  <Input
                    value={settings[`workshop${num}Name`]}
                    onChange={(e) => updateSetting(`workshop${num}Name`, e.target.value)}
                    placeholder={`اسم الورشة ${num}`}
                  />
                </div>
                <div className="w-20 space-y-1">
                  <label className="text-sm font-medium">الأيقونة</label>
                  <Input
                    value={settings[`workshop${num}Icon`]}
                    onChange={(e) => updateSetting(`workshop${num}Icon`, e.target.value)}
                    placeholder="📊"
                    className="text-center"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Trainer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              إعدادات المؤطرين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="space-y-2">
                <label className="text-sm font-medium">مؤطر الورشة {num}</label>
                <Input
                  value={settings[`trainer${num}Name`]}
                  onChange={(e) => updateSetting(`trainer${num}Name`, e.target.value)}
                  placeholder={`اسم المؤطر ${num}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              إعدادات عامة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">إجمالي الطلبة</label>
              <Input
                value={settings.totalStudents}
                onChange={(e) => updateSetting("totalStudents", e.target.value)}
                placeholder="113"
                type="number"
              />
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">ملخص الإعدادات الحالية</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المركز:</span>
                  <span className="font-medium">{settings.centerName} - {settings.centerLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">السنة الدراسية:</span>
                  <span className="font-medium">{settings.academicYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الورشات:</span>
                  <span className="font-medium">4 ورشات</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الطلبة:</span>
                  <span className="font-medium">{settings.totalStudents} متدرب</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("هل أنت متأكد من إعادة تعيين الإعدادات؟")) {
                  setSettings(DEFAULT_SETTINGS);
                  setHasChanges(true);
                  toast.success("تم إعادة التعيين");
                }
              }}
            >
              إعادة تعيين الإعدادات
            </Button>
            <Button
              variant="info"
              onClick={() => {
                const dataStr = JSON.stringify(settings, null, 2);
                const blob = new Blob([dataStr], { type: "application/json" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "settings-backup.json";
                link.click();
                toast.success("تم تصدير الإعدادات");
              }}
            >
              تصدير الإعدادات
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".json";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const imported = JSON.parse(event.target?.result as string);
                        setSettings({ ...DEFAULT_SETTINGS, ...imported });
                        setHasChanges(true);
                        toast.success("تم استيراد الإعدادات");
                      } catch {
                        toast.error("ملف غير صالح");
                      }
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
            >
              استيراد الإعدادات
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card className="border-2 border-primary/15">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            النسخ الاحتياطي لقاعدة البيانات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            إنشاء نسخة احتياطية كاملة من قاعدة البيانات (الطلبة، الحضور، النقاط) أو استعادتها.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button variant="success" onClick={handleBackup} disabled={backingUp}>
              {backingUp ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="ml-2 h-4 w-4" />
              )}
              إنشاء نسخة احتياطية
            </Button>
            <Button variant="warning" onClick={handleRestore} disabled={restoring}>
              {restoring ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="ml-2 h-4 w-4" />
              )}
              استعادة نسخة احتياطية
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
