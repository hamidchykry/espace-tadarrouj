"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings2,
  Megaphone,
  Save,
  Loader2,
  Trash2,
  Plus,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

const TRAINER_PAGES = [
  { key: "trainer_show_attendance", label: "تسجيل الحضور", desc: "تسجيل حضور وغياب المتدربين" },
  { key: "trainer_show_history", label: "سجل الحضور", desc: "سجل تسجيلات الحضور السابقة" },
  { key: "trainer_show_students", label: "قائمة الطلبة", desc: "عرض قوائم الطلبة" },
  { key: "trainer_show_stats", label: "الإحصائيات", desc: "إحصائيات الحضور" },
  { key: "trainer_show_profile", label: "الملف الشخصي", desc: "بيانات حساب المؤطر" },
  { key: "trainer_show_announcements", label: "الإعلانات", desc: "عرض إعلانات الإدارة" },
];

const DEFAULT_TOGGLES: Record<string, boolean> = Object.fromEntries(
  TRAINER_PAGES.map((p) => [p.key, true])
);

export default function TrainerPagesPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(DEFAULT_TOGGLES);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (cancelled) return;

        const nextToggles = { ...DEFAULT_TOGGLES };
        TRAINER_PAGES.forEach((p) => {
          const v = data[p.key];
          if (v !== undefined) nextToggles[p.key] = v === "true";
        });
        setToggles(nextToggles);

        if (data.announcements) {
          try {
            setAnnouncements(JSON.parse(data.announcements));
          } catch {
            setAnnouncements([]);
          }
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

  const addAnnouncement = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("يرجى إدخال عنوان ومحتوى الإعلان");
      return;
    }
    const item: Announcement = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      content: newContent.trim(),
      date: new Date().toISOString().split("T")[0],
    };
    setAnnouncements((prev) => [item, ...prev]);
    setNewTitle("");
    setNewContent("");
  };

  const removeAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings: Record<string, string> = {};
      TRAINER_PAGES.forEach((p) => {
        settings[p.key] = String(toggles[p.key]);
      });
      settings.announcements = JSON.stringify(announcements);

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        toast.success("تم حفظ الإعدادات بنجاح");
      } else {
        toast.error("خطأ في الحفظ");
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-primary" />
            التحكم في صفحات المؤطرين
          </h1>
          <p className="text-muted-foreground mt-1">
            حدد الصفحات التي يمكن للمؤطرين الوصول إليها وأرسل الإعلانات
          </p>
        </div>
        <Button variant="success" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="ml-2 h-4 w-4" />
          )}
          حفظ التغييرات
        </Button>
      </div>

      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <Info className="h-5 w-5 shrink-0" />
        <span>
          عند إيقاف أي صفحة من صفحات المؤطر، ستختفي من القائمة الجانبية لدى المؤطرين فوراً. صفحة تسجيل الحضور لا يمكن أن تبقى الأدمن مسؤولاً عن الحضور.
        </span>
      </div>

      {/* Trainer page toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            صفحات المؤطر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TRAINER_PAGES.map((page) => (
              <div key={page.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{page.label}</div>
                  <div className="text-sm text-muted-foreground">{page.desc}</div>
                </div>
                <button
                  role="switch"
                  aria-checked={toggles[page.key]}
                  onClick={() => setToggles((prev) => ({ ...prev, [page.key]: !prev[page.key] }))}
                  className={`relative h-8 w-14 rounded-full transition-colors ${toggles[page.key] ? "bg-green-500" : "bg-muted border"}`}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${toggles[page.key] ? "right-1" : "right-7"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            إدارة الإعلانات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">عنوان الإعلان</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: اجتماع المؤطرين"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">محتوى الإعلان</label>
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="اكتب نص الإعلان هنا..."
                rows={3}
              />
            </div>
            <Button variant="success" onClick={addAnnouncement}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة إعلان
            </Button>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">لا توجد إعلانات بعد</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{a.title}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{a.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive shrink-0"
                    onClick={() => removeAnnouncement(a.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
