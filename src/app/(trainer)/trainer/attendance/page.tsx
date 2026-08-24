"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ClipboardCheck,
  Search,
  Save,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useTrainer } from "@/lib/trainer-context";

interface Student {
  id: string;
  registrationNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  cohort: number;
}

const WORKSHOP_NAMES: Record<string, string> = {
  it: "المعلوميات",
  accounting: "المحاسبة",
  "labor-law": "قانون الشغل",
  tailoring: "الخياطة التقليدية",
};

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export default function TrainerAttendancePage() {
  const { trainer } = useTrainer();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCohort, setSelectedCohort] = useState("الكل");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [filterGender, setFilterGender] = useState<string>("الكل");
  const [tableCohort, setTableCohort] = useState<number>(0);

  const workshopName = WORKSHOP_NAMES[trainer?.workshopId || ""] || "ورشة";

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => {
        setStudents(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchCohort = selectedCohort === "الكل" || s.cohort === Number(selectedCohort);
    if (filterGender !== "الكل" && s.gender !== filterGender) return false;
    if (tableCohort !== 0 && s.cohort !== tableCohort) return false;
    const matchSearch =
      !searchQuery ||
      s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.registrationNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCohort && matchSearch;
  });

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    filteredStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendance((prev) => ({ ...prev, ...updated }));
  };

  const presentCount = filteredStudents.filter(
    (s) => attendance[s.id] === "PRESENT"
  ).length;
  const absentCount = filteredStudents.filter(
    (s) => attendance[s.id] === "ABSENT"
  ).length;
  const lateCount = filteredStudents.filter(
    (s) => attendance[s.id] === "LATE"
  ).length;
  const totalCount = filteredStudents.length;

  const handleSave = async () => {
    if (totalCount === 0) {
      toast.error("لا يوجد طلبة في هذا الفوج");
      return;
    }

    const unmarked = filteredStudents.filter((s) => !attendance[s.id]);
    if (unmarked.length > 0) {
      toast.error(`يجب تسجيل حضور ${unmarked.length} متدرب`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/trainer/attendance-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          cohort: Number(selectedCohort),
          workshopName,
          presentCount,
          absentCount,
          lateCount,
          totalCount,
        }),
      });

      if (res.ok) {
        toast.success("تم حفظ الحضور بنجاح");
        setTimeout(() => window.print(), 500);
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

  const getStatusColor = (status?: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return "border-green-300 bg-green-100 text-green-800";
      case "ABSENT":
        return "border-red-300 bg-red-100 text-red-800";
      case "LATE":
        return "border-yellow-300 bg-yellow-100 text-yellow-800";
      default:
        return "border-gray-300 bg-gray-100 text-gray-600";
    }
  };

  const getStatusText = (status?: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return "حاضر";
      case "ABSENT":
        return "غائب";
      case "LATE":
        return "متأخر";
      default:
        return "لم يتم التسجيل";
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <ClipboardCheck className="h-7 w-7 text-primary" />
            تسجيل الحضور
          </h1>
          <p className="text-muted-foreground mt-1">{workshopName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="info" onClick={() => window.print()}>
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
          <Button variant="success" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="ml-2 h-4 w-4" />
            )}
            حفظ
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-6">
        <h2 className="text-xl font-bold">طلبة التدرج المهني - بوجدور</h2>
        <p className="text-sm mt-1">{workshopName}</p>
        <p className="text-sm mt-1">
          التاريخ: {new Date(selectedDate).toLocaleDateString("ar-MA")} | الفوج: {selectedCohort}
        </p>
      </div>

      {/* Filters */}
      <Card className="border-2 border-primary/15 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-sm">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10">
              <Search className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="text-base font-bold text-primary">عناصر البحث</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
                <span className="text-base">📅</span>التاريخ
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-11 text-sm border-2 border-primary/15 focus:border-primary bg-background shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
                <span className="text-base">👥</span>الفوج
              </label>
              <select
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="flex h-11 w-full items-center rounded-lg border-2 border-primary/15 bg-background px-3 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none"
              >
                <option value="الكل">الكل</option>
                <option value="1">الفوج الأول (1-25)</option>
                <option value="2">الفوج الثاني (26-50)</option>
                <option value="3">الفوج الثالث (51-75)</option>
                <option value="4">الفوج الرابع (76-113)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
                <span className="text-base">🔍</span>بحث
              </label>
              <div className="relative">
                <Search className="absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو رقم التسجيل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 text-sm pr-10 border-2 border-primary/15 focus:border-primary bg-background shadow-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="success" size="sm" onClick={() => markAll("PRESENT")}>
          <CheckCircle className="ml-1 h-4 w-4" />
          الكل حاضر
        </Button>
        <Button variant="danger" size="sm" onClick={() => markAll("ABSENT")}>
          <XCircle className="ml-1 h-4 w-4" />
          الكل غائب
        </Button>
        <Button variant="warning" size="sm" onClick={() => markAll("LATE")}>
          <Clock className="ml-1 h-4 w-4" />
          الكل متأخر
        </Button>
        <div className="mr-auto flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            حاضر: {presentCount}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            غائب: {absentCount}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            متأخر: {lateCount}
          </span>
          <span className="font-bold">المجموع: {totalCount}</span>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/10 border-b-2 border-primary/20">
                <TableHead className="w-12 text-center font-bold">الر.ت</TableHead>
                <TableHead className="text-center font-bold">رقم التسجيل</TableHead>
                <TableHead className="text-center font-bold">اسم المتدرب</TableHead>
                <TableHead className="text-center font-bold">
                  <div className="flex flex-col items-center gap-1">
                    <span>الجنس</span>
                    <div className="flex gap-1">
                      <button onClick={() => setFilterGender(filterGender === "F" ? "الكل" : "F")} className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${filterGender === "F" ? "bg-pink-500 text-white" : "bg-pink-100 text-pink-600 hover:bg-pink-200"}`}>♀</button>
                      <button onClick={() => setFilterGender(filterGender === "M" ? "الكل" : "M")} className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${filterGender === "M" ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}>♂</button>
                    </div>
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold">
                  <div className="flex flex-col items-center gap-1">
                    <span>الفوج</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4].map((c) => (
                        <button key={c} onClick={() => setTableCohort(tableCohort === c ? 0 : c)} className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${tableCohort === c ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>لا توجد نتائج</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, index) => {
                  const status = attendance[student.id];
                  return (
                    <TableRow
                      key={student.id}
                      className={index % 2 === 0 ? "bg-white border-b" : "bg-muted/30 border-b"}
                    >
                      <TableCell className="text-center text-sm text-muted-foreground font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-[100px] h-8 rounded-lg text-xs font-bold font-mono bg-primary/10 text-primary border border-primary/20">
                          {student.registrationNo}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-medium" title={`${student.firstName} ${student.lastName}`}>
                          {student.firstName} {student.lastName}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center justify-center w-16 h-8 rounded-lg text-sm font-bold border ${student.gender === "F" ? "border-pink-300 bg-pink-100 text-pink-700" : "border-blue-300 bg-blue-100 text-blue-700"}`}>
                          {student.gender === "F" ? "♀ أنثى" : "♂ ذكر"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-16 h-8 rounded-lg text-sm font-bold bg-primary/10 text-primary border border-primary/20">
                          فوج {student.cohort}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`inline-flex items-center justify-center min-w-[80px] h-8 rounded-lg text-sm font-bold border ${getStatusColor(status)}`}>
                            {getStatusText(status)}
                          </span>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              onClick={() => setStudentStatus(student.id, "PRESENT")}
                              className={`h-8 w-8 p-0 ${
                                status === "PRESENT"
                                  ? "bg-green-100 text-green-700 ring-2 ring-green-300 hover:bg-green-100"
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                              title="حاضر"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setStudentStatus(student.id, "ABSENT")}
                              className={`h-8 w-8 p-0 ${
                                status === "ABSENT"
                                  ? "bg-red-100 text-red-700 ring-2 ring-red-300 hover:bg-red-100"
                                  : "bg-red-50 text-red-600 hover:bg-red-100"
                              }`}
                              title="غائب"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setStudentStatus(student.id, "LATE")}
                              className={`h-8 w-8 p-0 ${
                                status === "LATE"
                                  ? "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300 hover:bg-yellow-100"
                                  : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                              }`}
                              title="متأخر"
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block mt-12">
        <div className="flex justify-between items-end">
          <div className="text-center">
            <p className="text-sm">توقيع المدرب</p>
            <div className="w-40 border-b mt-8" />
          </div>
          <div className="text-center">
            <p className="text-sm">توقيع المشرف</p>
            <div className="w-40 border-b mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
