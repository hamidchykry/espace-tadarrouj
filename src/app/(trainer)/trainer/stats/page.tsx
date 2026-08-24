"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle,
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

const COLORS = ["#22c55e", "#ef4444", "#eab308"];

export default function TrainerStatsPage() {
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

  const totalPresent = logs.reduce((sum, l) => sum + l.presentCount, 0);
  const totalAbsent = logs.reduce((sum, l) => sum + l.absentCount, 0);
  const totalLate = logs.reduce((sum, l) => sum + l.lateCount, 0);
  const totalRecorded = totalPresent + totalAbsent + totalLate;
  const overallRate = totalRecorded > 0 ? ((totalPresent / totalRecorded) * 100).toFixed(1) : "0";

  const pieData = [
    { name: "حاضر", value: totalPresent },
    { name: "غائب", value: totalAbsent },
    { name: "متأخر", value: totalLate },
  ];

  const cohortData = [1, 2, 3, 4].map((cohort) => {
    const cohortLogs = logs.filter((l) => l.cohort === cohort);
    return {
      name: `الفوج ${cohort}`,
      sessions: cohortLogs.length,
      present: cohortLogs.reduce((s, l) => s + l.presentCount, 0),
      absent: cohortLogs.reduce((s, l) => s + l.absentCount, 0),
    };
  });

  const dailyData = logs
    .slice()
    .reverse()
    .map((l) => ({
      date: new Date(l.date).toLocaleDateString("ar-MA", { month: "short", day: "numeric" }),
      نسبة: l.totalCount > 0 ? Number(((l.presentCount / l.totalCount) * 100).toFixed(1)) : 0,
    }));

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
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-primary" />
          الإحصائيات
        </h1>
        <p className="text-muted-foreground mt-1">{workshopName} - إحصائيات الحضور</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-100">إجمالي الجلسات</p>
            <Calendar className="h-5 w-5 text-blue-200" />
          </div>
          <p className="text-4xl font-bold">{logs.length}</p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-100">نسبة الحضور</p>
            <TrendingUp className="h-5 w-5 text-green-200" />
          </div>
          <p className="text-4xl font-bold">{overallRate}%</p>
          <p className="text-green-200 text-xs mt-1">{totalPresent} حاضر من {totalRecorded}</p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-emerald-100">إجمالي الحضور</p>
            <CheckCircle className="h-5 w-5 text-emerald-200" />
          </div>
          <p className="text-4xl font-bold">{totalPresent}</p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-100">غياب + تأخر</p>
            <Users className="h-5 w-5 text-red-200" />
          </div>
          <p className="text-4xl font-bold">{totalAbsent + totalLate}</p>
          <p className="text-red-200 text-xs mt-1">{totalAbsent} غائب • {totalLate} متأخر</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart - Attendance Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-primary" />
              توزيع الحضور
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalRecorded === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <p>لا توجد بيانات بعد</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">حاضر ({totalPresent})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">غائب ({totalAbsent})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">متأخر ({totalLate})</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Per Cohort */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-primary" />
              الحضور حسب الفوج
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <p>لا توجد بيانات بعد</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cohortData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="present" fill="#22c55e" name="حاضر" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="#ef4444" name="غائب" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Chart - Daily Trend */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            تطور نسبة الحضور اليومية
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              <p>لا توجد بيانات بعد</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => [`${value}%`, "نسبة الحضور"]}
                />
                <Line
                  type="monotone"
                  dataKey="نسبة"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
