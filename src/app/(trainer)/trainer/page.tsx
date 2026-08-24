"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClipboardCheck,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { useTrainer } from "@/lib/trainer-context";

interface AttendanceLog {
  id: string;
  date: string;
  cohort: number;
  workshopName: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalCount: number;
}

const WORKSHOP_NAMES: Record<string, string> = {
  it: "المعلوميات",
  accounting: "المحاسبة",
  "labor-law": "قانون الشغل",
  tailoring: "الخياطة التقليدية",
};

export default function TrainerDashboard() {
  const { trainer } = useTrainer();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  const workshopName = WORKSHOP_NAMES[trainer?.workshopId || ""] || "ورشة";

  useEffect(() => {
    fetch("/api/trainer/attendance-log")
      .then((r) => r.json())
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalSessions = logs.length;
  const totalPresent = logs.reduce((sum, l) => sum + l.presentCount, 0);
  const totalAbsent = logs.reduce((sum, l) => sum + l.absentCount, 0);
  const totalLate = logs.reduce((sum, l) => sum + l.lateCount, 0);
  const totalRecorded = totalPresent + totalAbsent + totalLate;
  const attendanceRate = totalRecorded > 0 ? ((totalPresent / totalRecorded) * 100).toFixed(1) : "0";

  const recentLogs = logs.slice(0, 5);

  if (loading || !trainer) {
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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
        <div className="relative">
          <h1 className="text-2xl font-bold">مرحباً {trainer.name}</h1>
          <p className="text-white/80 mt-1">{workshopName} - طلبة التدرج المهني</p>
          <div className="flex items-center gap-2 mt-3 text-sm text-white/70">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString("ar-MA", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-100">إجمالي الجلسات</p>
            <ClipboardCheck className="h-5 w-5 text-blue-200" />
          </div>
          <div className="text-4xl font-bold">{totalSessions}</div>
          <p className="text-blue-200 text-xs mt-1">جلسة مسجلة</p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-100">نسبة الحضور</p>
            <TrendingUp className="h-5 w-5 text-green-200" />
          </div>
          <div className="text-4xl font-bold">{attendanceRate}%</div>
          <p className="text-green-200 text-xs mt-1">{totalPresent} حاضر من {totalRecorded}</p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-emerald-100">الحاضرون</p>
            <Users className="h-5 w-5 text-emerald-200" />
          </div>
          <div className="text-4xl font-bold">{totalPresent}</div>
          <p className="text-emerald-200 text-xs mt-1">تسجيل حضور</p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-100">الغائبون</p>
            <Clock className="h-5 w-5 text-red-200" />
          </div>
          <div className="text-4xl font-bold">{totalAbsent + totalLate}</div>
          <p className="text-red-200 text-xs mt-1">{totalAbsent} غائب • {totalLate} متأخر</p>
        </div>
      </div>

      {/* Quick Actions + Recent */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/trainer/attendance"
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-l from-green-500/10 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 border border-green-200/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <ClipboardCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">تسجيل الحضور</p>
                  <p className="text-xs text-muted-foreground">تسجيل حضور وغياب المتدربين</p>
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
            </Link>

            <Link
              href="/trainer/history"
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-l from-blue-500/10 to-blue-500/5 hover:from-blue-500/20 hover:to-blue-500/10 border border-blue-200/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">سجل الحضور</p>
                  <p className="text-xs text-muted-foreground">عرض السجلات السابقة</p>
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </Link>

            <Link
              href="/trainer/students"
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-l from-purple-500/10 to-purple-500/5 hover:from-purple-500/20 hover:to-purple-500/10 border border-purple-200/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">قائمة الطلبة</p>
                  <p className="text-xs text-muted-foreground">عرض بيانات المتدربين</p>
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              آخر النشاطات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد نشاطات بعد</p>
                <p className="text-xs mt-1">ابدأ بتسجيل الحضور</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div>
                        <p className="text-sm font-medium">الفوج {log.cohort}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.date).toLocaleDateString("ar-MA")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-green-600">{log.presentCount} ح</span>
                      <span className="text-red-600">{log.absentCount} غ</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
