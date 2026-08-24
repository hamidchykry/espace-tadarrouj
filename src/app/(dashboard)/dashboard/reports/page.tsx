"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FileText,
  Download,
  Calendar,
  Users,
  ClipboardCheck,
  Award,
  BookOpen,
  Printer,
} from "lucide-react";
import { WORKSHOPS, COHORTS } from "@/lib/data";

interface StatsData {
  students: {
    total: number;
    female: number;
    male: number;
    textile: number;
    cuir: number;
  };
  cohorts: { id: number; count: number }[];
  workshops: { id: string; name: string }[];
  attendance: { present: number; absent: number; late: number };
  grades: {
    average: number | null;
    highest: number | null;
    lowest: number | null;
    total: number;
  };
  recentAttendance: {
    date: string;
    status: string;
    student: { firstName: string; lastName: string };
    workshop: { name: string };
  }[];
}

export default function ReportsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [attendance, setAttendance] = useState<
    { date: string; status: string; workshopId: string }[]
  >([]);
  const [grades, setGrades] = useState<{ date: string; score: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCohort, setFilterCohort] = useState("الكل");
  const [filterWorkshop, setFilterWorkshop] = useState("الكل");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/stats"),
      fetch(`/api/attendance?workshop=${filterWorkshop}&cohort=${filterCohort}`),
      fetch(`/api/grades?workshopId=${filterWorkshop}`),
    ])
      .then(async ([statsRes, attendanceRes, gradesRes]) => {
        const [statsData, attendanceData, gradesData] = await Promise.all([
          statsRes.json(),
          attendanceRes.json(),
          gradesRes.json(),
        ]);
        if (cancelled) return;
        setStats(statsData);
        if (Array.isArray(attendanceData)) {
          setAttendance(
            attendanceData.map((a: Record<string, unknown>) => ({
              date: new Date(a.date as string).toISOString().split("T")[0],
              status: a.status as string,
              workshopId: (a.workshopId as string) || "",
            }))
          );
        }
        if (Array.isArray(gradesData)) {
          setGrades(
            gradesData.map((g: Record<string, unknown>) => ({
              date: new Date(g.date as string).toISOString().split("T")[0],
              score: g.score as number,
            }))
          );
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [filterCohort, filterWorkshop]);

  const attendanceTotal = attendance.length;

  const attendanceRate =
    attendanceTotal > 0
      ? Math.round(
          (attendance.filter((a) => a.status === "PRESENT").length / attendanceTotal) * 100
        )
      : 0;

  const workshopStats = WORKSHOPS.map((w) => {
    const ws = stats?.workshops.find((sw) => sw.id === w.id);
    const present = attendance.filter(
      (a) => a.status === "PRESENT" && a.workshopId === w.id
    ).length;
    return {
      id: w.id,
      name: ws?.name || w.name,
      icon: w.icon,
      students: stats?.students.total || 0,
      present,
    };
  }).filter((w) => filterWorkshop === "الكل" || filterWorkshop === w.id);

  const attendanceData = attendance.length
    ? [
        {
          name: "حاضر",
          value: attendance.filter((a) => a.status === "PRESENT").length,
          color: "#10b981",
        },
        {
          name: "غائب",
          value: attendance.filter((a) => a.status === "ABSENT").length,
          color: "#ef4444",
        },
        {
          name: "متأخر",
          value: attendance.filter((a) => a.status === "LATE").length,
          color: "#f59e0b",
        },
      ]
    : [];

  const byMonth = new Map<string, { present: number; absent: number; late: number }>();
  attendance.forEach((a) => {
    const month = a.date.slice(0, 7);
    const m = byMonth.get(month) || { present: 0, absent: 0, late: 0 };
    if (a.status === "PRESENT") m.present++;
    else if (a.status === "ABSENT") m.absent++;
    else if (a.status === "LATE") m.late++;
    byMonth.set(month, m);
  });
  const monthlyAttendance = [...byMonth.entries()]
    .map(([month, m]) => {
      const [y, mo] = month.split("-");
      const names = ["", "يناير", "فبراير", "مارس", "أبريل", "ماي", "يونيو", "يوليوز", "غشت", "شتنبر", "أكتوبر", "نونبر", "دجنبر"];
      return {
        month: `${names[Number(mo)]} ${y}`,
        حضور: m.present,
        غياب: m.absent,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  const byMonthGrades = new Map<string, { sum: number; count: number }>();
  grades.forEach((g) => {
    const month = g.date.slice(0, 7);
    const m = byMonthGrades.get(month) || { sum: 0, count: 0 };
    m.sum += g.score;
    m.count++;
    byMonthGrades.set(month, m);
  });
  const gradeTrends = [...byMonthGrades.entries()]
    .map(([month, m]) => {
      const [y, mo] = month.split("-");
      const names = ["", "يناير", "فبراير", "مارس", "أبريل", "ماي", "يونيو", "يوليوز", "غشت", "شتنبر", "أكتوبر", "نونبر", "دجنبر"];
      return {
        month: `${names[Number(mo)]} ${y}`,
        المعدل: Number((m.sum / m.count).toFixed(2)),
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  const generateReport = (type: string) => {
    const title =
      type === "attendance"
        ? "تقرير الحضور والغياب"
        : type === "grades"
        ? "تقرير النقاط والتقييم"
        : "تقرير الطلبة";

    const content = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: 'Arial', sans-serif; padding: 20px; direction: rtl; }
          h1 { text-align: center; color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header p { color: #666; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
          th { background-color: #1e40af; color: white; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-box { text-align: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>طلبة التدرج المهني</p>
          <p>${new Date().toLocaleDateString("ar-MA")}</p>
        </div>
        <div class="stats">
          <div class="stat-box">
            <div class="stat-value">${stats?.students.total || 0}</div>
            <div>إجمالي الطلبة</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${WORKSHOPS.length}</div>
            <div>الورشات</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${COHORTS.length}</div>
            <div>الأفواج</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${attendanceRate}%</div>
            <div>نسبة الحضور</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>الفوج</th>
              <th>العدد</th>
            </tr>
          </thead>
          <tbody>
            ${COHORTS.map((c) => {
              const found = stats?.cohorts.find((sc) => sc.id === c.id);
              return `<tr><td>${c.name}</td><td>${found?.count || 0}</td></tr>`;
            }).join("")}
          </tbody>
        </table>
        <div class="footer">
          <p>نظام إدارة طلبة التدرج المهني - بوجدور</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title}.html`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            التقارير
          </h1>
          <p className="text-muted-foreground mt-1">
            إعداد وتحميل تقارير الطلبة والحضور والنقاط
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="info" onClick={() => window.print()}>
            <Printer className="ml-2 h-4 w-4" />
            طباعة الصفحة
          </Button>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => generateReport("attendance")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ClipboardCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">تقرير الحضور والغياب</h3>
                <p className="text-sm text-muted-foreground">
                  إحصائيات شاملة عن حضور المتدربين
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                variant="info"
                onClick={(e) => {
                  e.stopPropagation();
                  generateReport("attendance");
                }}
              >
                <Download className="ml-2 h-4 w-4" />
                تحميل
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => generateReport("grades")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">تقرير النقاط والتقييم</h3>
                <p className="text-sm text-muted-foreground">
                  نتائج التقييمات في جميع الورشات
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                variant="info"
                onClick={(e) => {
                  e.stopPropagation();
                  generateReport("grades");
                }}
              >
                <Download className="ml-2 h-4 w-4" />
                تحميل
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => generateReport("students")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">تقرير الطلبة</h3>
                <p className="text-sm text-muted-foreground">
                  القائمة الكاملة بالمتدربين
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                variant="info"
                onClick={(e) => {
                  e.stopPropagation();
                  generateReport("students");
                }}
              >
                <Download className="ml-2 h-4 w-4" />
                تحميل
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={filterCohort}
          onValueChange={(v) => setFilterCohort(v ?? "الكل")}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="فلتر حسب الفوج" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">جميع الأفواج</SelectItem>
            {COHORTS.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterWorkshop}
          onValueChange={(v) => setFilterWorkshop(v ?? "الكل")}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="فلتر حسب الورشة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">جميع الورشات</SelectItem>
            {WORKSHOPS.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.icon} {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              توزيع الحضور
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceTotal > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={attendanceData}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                لا توجد بيانات حضور بعد
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              توزيع الحضور (دائري)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceTotal > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                لا توجد بيانات حضور بعد
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              الحضور الشهري
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyAttendance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="حضور" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="غياب" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                لا توجد بيانات حضور بعد
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              المعدل الشهري
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gradeTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={gradeTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 20]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="المعدل"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                لا توجد بيانات نقاط بعد
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workshop Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            إحصائيات الورشات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workshopStats.map((w) => {
              const colors = ["bg-indigo-50 text-indigo-700 border-indigo-200", "bg-purple-50 text-purple-700 border-purple-200", "bg-violet-50 text-violet-700 border-violet-200", "bg-pink-50 text-pink-700 border-pink-200"];
              const idx = WORKSHOPS.findIndex((ww) => ww.id === w.id);
              return (
                <div key={w.id} className={`p-4 rounded-xl border-2 ${colors[idx % colors.length]}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{w.icon}</span>
                    <h4 className="font-bold">{w.name}</h4>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-70">المتدربون</span>
                      <span className="font-bold">{w.students}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-70">الحاضرون</span>
                      <span className="font-bold">{w.present}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-4xl font-bold">{stats?.students.total || 0}</div>
          <div className="text-blue-100 mt-1 text-sm">إجمالي المتدربين</div>
          <div className="flex items-center gap-3 mt-2 text-blue-200 text-xs">
            <span>♂ {stats?.students.male || 0}</span>
            <span>♀ {stats?.students.female || 0}</span>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <div className="text-4xl font-bold">{attendanceRate}%</div>
          <div className="text-green-100 mt-1 text-sm">نسبة الحضور المسجلة</div>
          <div className="flex items-center gap-3 mt-2 text-green-200 text-xs">
            <span>حاضر: {attendance.filter((a) => a.status === "PRESENT").length}</span>
            <span>غياب: {attendance.filter((a) => a.status === "ABSENT").length}</span>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <div className="text-4xl font-bold">
            {grades.length > 0
              ? `${(grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1)}`
              : "-"}
            <span className="text-lg font-normal text-purple-200">/20</span>
          </div>
          <div className="text-purple-100 mt-1 text-sm">المعدل العام</div>
        </div>
        <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <div className="text-4xl font-bold">{grades.length}</div>
          <div className="text-amber-100 mt-1 text-sm">إجمالي التقييمات</div>
        </div>
      </div>
    </div>
  );
}
