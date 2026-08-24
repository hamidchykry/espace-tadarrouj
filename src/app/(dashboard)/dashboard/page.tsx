"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  ClipboardCheck,
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  UserCheck,
  UserX,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
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
  Legend,
} from "recharts";
import Link from "next/link";

interface Stats {
  students: { total: number; female: number; male: number; textile: number; cuir: number };
  cohorts: { id: number; count: number }[];
  workshops: { id: string; name: string; icon: string | null }[];
  attendance: { present: number; absent: number; late: number };
  grades: { average: number | null; highest: number | null; lowest: number | null; total: number };
}

const COHORT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
const WORKSHOP_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [workshopAttendance, setWorkshopAttendance] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);

    fetch("/api/attendance")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const counts: Record<string, number> = {};
        data.forEach((a: { workshopId?: string; status?: string }) => {
          if (a.status === "PRESENT" && a.workshopId) {
            counts[a.workshopId] = (counts[a.workshopId] || 0) + 1;
          }
        });
        setWorkshopAttendance(counts);
      })
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          جاري التحميل...
        </div>
      </div>
    );
  }

  const totalAttendance = stats.attendance.present + stats.attendance.absent + stats.attendance.late;
  const attendanceRate = totalAttendance > 0 ? ((stats.attendance.present / totalAttendance) * 100).toFixed(1) : "0";

  const attendanceData = [
    { name: "الحاضرون", value: stats.attendance.present, color: "#10b981" },
    { name: "الغائبون", value: stats.attendance.absent, color: "#ef4444" },
    { name: "المتأخرون", value: stats.attendance.late, color: "#f59e0b" },
  ];

  const workshopData = stats.workshops.map((w, i) => ({
    name: w.name,
    الحضور: workshopAttendance[w.id] || 0,
    fill: WORKSHOP_COLORS[i % WORKSHOP_COLORS.length],
  }));

  const cohortData = stats.cohorts.map((c) => ({
    name: `الفوج ${c.id}`,
    value: c.count,
  }));

  const specializationData = [
    { name: "الخياطة التقليدية", value: stats.students.textile, color: "#3b82f6" },
    { name: "صناعة الجلود", value: stats.students.cuir, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">لوحة القيادة</h1>
          <p className="text-muted-foreground mt-1">
            نظام إدارة طلبة التدرج المهني
          </p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
          <Calendar className="inline h-4 w-4 ml-2" />
          {new Date().toLocaleDateString("ar-MA", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/students">
          <Card className="hover:shadow-lg transition-all bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">إجمالي الطلبة</CardTitle>
              <Users className="h-5 w-5 text-blue-200 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.students.total}</div>
              <div className="flex items-center gap-4 mt-2 text-blue-100 text-sm">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-pink-300" />
                  {stats.students.female} أنثى
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-200" />
                  {stats.students.male} ذكر
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-lg transition-all bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">نسبة الحضور</CardTitle>
            <Percent className="h-5 w-5 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{attendanceRate}%</div>
            <div className="flex items-center gap-4 mt-2 text-green-100 text-sm">
              <span className="flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                {stats.attendance.present} حاضر
              </span>
              <span className="flex items-center gap-1">
                <UserX className="h-3 w-3" />
                {stats.attendance.absent} غائب
              </span>
            </div>
          </CardContent>
        </Card>

        <Link href="/dashboard/grades">
          <Card className="hover:shadow-lg transition-all bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-100">متوسط التقييمات</CardTitle>
              <Award className="h-5 w-5 text-amber-200 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {stats.grades.average ? `${stats.grades.average.toFixed(1)}` : "-"}
                <span className="text-lg font-normal text-amber-200">/20</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-amber-100 text-sm">
                {stats.grades.highest !== null && (
                  <span className="flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    أعلى: {stats.grades.highest}
                  </span>
                )}
                {stats.grades.lowest !== null && (
                  <span className="flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3" />
                    أدنى: {stats.grades.lowest}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/cohorts">
          <Card className="hover:shadow-lg transition-all bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">الأفواج النشطة</CardTitle>
              <BookOpen className="h-5 w-5 text-purple-200 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.cohorts.length}</div>
              <div className="flex flex-wrap gap-2 mt-2 text-purple-100 text-sm">
                {stats.cohorts.map((c) => (
                  <span key={c.id} className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
                    فوج {c.id}: {c.count}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التخصصات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={specializationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {specializationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأفواج</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={cohortData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  dataKey="value"
                >
                  {cohortData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COHORT_COLORS[index % COHORT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الورشات النشطة</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.workshops.map((w) => (
                <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{w.icon}</span>
                    <span className="text-sm font-medium">{w.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-1">
                    {workshopAttendance[w.id] || 0} حضور
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-green-600" />
              توزيع الحضور اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalAttendance > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                لا توجد بيانات حضور اليوم
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              حضور المتدربين حسب الورشة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workshopData.some((w) => (typeof w["الحضور"] === "number" ? w["الحضور"] : 0) > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workshopData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="الحضور" radius={[0, 8, 8, 0]}>
                    {workshopData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
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
      </div>
    </div>
  );
}
