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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  X,
  Clock,
  Save,
  Download,
  CheckCheck,
  XCircle,
  Search,
  Loader2,
  Printer,
} from "lucide-react";
import { WORKSHOPS, COHORTS } from "@/lib/data";
import { toast } from "sonner";

interface Student {
  id: string;
  registrationNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  cohort: number;
}

interface AttendanceRecord {
  id: string;
  date: string;
  session: string;
  status: string;
  studentId: string;
  workshopId: string;
}

type Status = "PRESENT" | "ABSENT" | "LATE";

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>("الكل");
  const [selectedCohort, setSelectedCohort] = useState<number>(0);
  const [selectedSession, setSelectedSession] = useState<string>("الكل");
  const [attendance, setAttendance] = useState<Record<string, Status>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [filterGender, setFilterGender] = useState<string>("الكل");
  const [tableCohort, setTableCohort] = useState<number>(0);

  const getNextThursday = (from?: Date): Date => {
    const d = from ? new Date(from) : new Date();
    const day = d.getDay();
    const diff = (4 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d;
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    if (now.getDay() === 4) return now.toISOString().split("T")[0];
    return getNextThursday(now).toISOString().split("T")[0];
  });

  const isThursday = new Date(selectedDate).getDay() === 4;
  const canSave = selectedWorkshop !== "الكل" && selectedSession !== "الكل" && selectedCohort !== 0 && isThursday;

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const params = new URLSearchParams({
          date: selectedDate,
          workshop: selectedWorkshop,
          cohort: String(selectedCohort),
          session: selectedSession,
        });
        const res = await fetch(`/api/attendance?${params}`);
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          const map: Record<string, Status> = {};
          data.forEach((r: AttendanceRecord) => {
            map[r.studentId] = r.status as Status;
          });
          setAttendance(map);
        }
      } catch {
        if (!cancelled) setAttendance({});
      }
    };
    load();
    return () => { cancelled = true; };
  }, [selectedDate, selectedWorkshop, selectedCohort, selectedSession, reloadKey]);

  const currentStudents = selectedCohort === 0
    ? students
    : students.filter((s) => s.cohort === selectedCohort);

  const filteredStudents = currentStudents.filter((s) => {
    if (filterGender !== "الكل" && s.gender !== filterGender) return false;
    if (tableCohort !== 0 && s.cohort !== tableCohort) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.registrationNo.toLowerCase().includes(q)
    );
  });

  const updateStatus = (studentId: string, status: Status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newAttendance: Record<string, Status> = {};
    filteredStudents.forEach((s) => {
      newAttendance[s.id] = "PRESENT";
    });
    setAttendance((prev) => ({ ...prev, ...newAttendance }));
    toast.success("تم تحديد الجميع كحاضرين");
  };

  const markAllAbsent = () => {
    const newAttendance: Record<string, Status> = {};
    filteredStudents.forEach((s) => {
      newAttendance[s.id] = "ABSENT";
    });
    setAttendance((prev) => ({ ...prev, ...newAttendance }));
    toast.success("تم تحديد الجميع كغائبين");
  };

  const getStatusColor = (status?: Status) => {
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

  const getStatusText = (status?: Status) => {
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

  const presentCount = Object.values(attendance).filter((s) => s === "PRESENT").length;
  const absentCount = Object.values(attendance).filter((s) => s === "ABSENT").length;
  const lateCount = Object.values(attendance).filter((s) => s === "LATE").length;

  const handleExportSheet = () => {
    const workshopName = selectedWorkshop === "الكل" ? "جميع الورشات" : WORKSHOPS.find((w) => w.id === selectedWorkshop)?.name || "";
    const cohort = selectedCohort === 0 ? null : COHORTS.find((c) => c.id === selectedCohort);

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>ورقة حضور - ${workshopName}</title>
        <style>
          @page { size: A4 landscape; margin: 8mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; direction: rtl; font-size: 11px; }
          h1 { text-align: center; font-size: 16px; margin-bottom: 2px; }
          h2 { text-align: center; font-size: 12px; color: #555; margin-bottom: 8px; }
          .header-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 12px; margin-bottom: 10px; font-size: 11px; background: #f5f5f5; padding: 8px 12px; border-radius: 4px; }
          .header-info div { display: flex; gap: 4px; }
          .header-info strong { min-width: 60px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th, td { border: 1px solid #333; padding: 3px 4px; text-align: center; }
          th { background-color: #e0e0e0; font-weight: bold; font-size: 10px; }
          .checkbox { width: 14px; height: 14px; border: 1.5px solid #000; display: inline-block; }
          .signature { margin-top: 15px; display: flex; justify-content: space-between; }
          .signature-line { border-top: 1px solid #000; width: 150px; text-align: center; padding-top: 3px; font-size: 10px; }
          .footer { margin-top: 10px; text-align: center; font-size: 9px; color: #666; border-top: 1px solid #ddd; padding-top: 5px; }
          @media print { body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>ورقة تسجيل الحضور والغياب</h1>
        <h2>طلبة التدرج المهني</h2>
        
        <div class="header-info">
          <div><strong>التاريخ:</strong> ${selectedDate}</div>
          <div><strong>الورشة:</strong> ${workshopName}</div>
          <div><strong>الفوج:</strong> ${cohort?.name || "جميع الأفواج"}</div>
          <div><strong>الحصة:</strong> ${selectedSession === "MORNING" ? "صباحية" : selectedSession === "AFTERNOON" ? "مسائية" : "جميع الحصص"}</div>
          <div><strong>المؤطر:</strong> _______________</div>
          <div><strong>السنة:</strong> 2025-2026</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:4%">الرقم</th>
              <th style="width:12%">رقم التسجيل</th>
              <th style="width:22%">اسم المتدرب</th>
              <th style="width:6%">الجنس</th>
              <th style="width:6%">الفوج</th>
              <th style="width:6%">الحضور</th>
              <th style="width:6%">الغياب</th>
              <th style="width:6%">متأخر</th>
              <th style="width:32%">الملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${currentStudents
              .map(
                (student, index) => `
              <tr>
                <td>${index + 1}</td>
                <td style="font-size:9px">${student.registrationNo}</td>
                <td style="text-align:right">${student.firstName} ${student.lastName}</td>
                <td>${student.gender === "F" ? "أنثى" : "ذكر"}</td>
                <td>${student.cohort}</td>
                <td><div class="checkbox"></div></td>
                <td><div class="checkbox"></div></td>
                <td><div class="checkbox"></div></td>
                <td></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="signature">
          <div>
            <div class="signature-line">توقيع المؤطر</div>
          </div>
          <div>
            <div class="signature-line">توقيع المنسق</div>
          </div>
          <div>
            <div class="signature-line">توقيع المدير</div>
          </div>
        </div>

        <div class="footer">
          تم طباعة هذا المستند في ${new Date().toLocaleDateString("ar-MA")} - نظام إدارة طلبة التدرج المهني
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSave = async () => {
    const total = currentStudents.length;
    const recorded = presentCount + absentCount + lateCount;

    if (recorded === 0) {
      toast.error("يرجى تسجيل حضور المتدربين أولاً");
      return;
    }

    if (recorded < total) {
      toast.warning(`لم يتم تسجيل ${total - recorded} متدرب بعد`);
      return;
    }

    setSaving(true);
    try {
      const records = currentStudents.map((s) => ({
        studentId: s.id,
        status: attendance[s.id] || "ABSENT",
      }));

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          session: selectedSession,
          workshopId: selectedWorkshop,
          records,
        }),
      });

      if (res.ok) {
        toast.success("تم حفظ التسجيل بنجاح! يمكنك استرجاع التسجيل عند اختيار نفس التاريخ والفوج والورشة والحصة");
        setReloadKey((k) => k + 1);
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

  const workshopName = WORKSHOPS.find((w) => w.id === selectedWorkshop)?.name || "";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Check className="h-8 w-8 text-primary" />
            الحضور والغياب
          </h1>
          <p className="text-muted-foreground mt-1">
            تسجيل حضور وغياب المتدربين - {workshopName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="info" onClick={handleExportSheet}>
            <Download className="ml-2 h-4 w-4" />
            تصدير ورقة الحضور
          </Button>
          <Button variant="warning" onClick={() => window.print()} title="طباعة كشف الحضور الحالي">
            <Printer className="ml-2 h-4 w-4" />
            طباعة الكشف
          </Button>
          <Button variant="success" onClick={handleSave} disabled={saving || !canSave} title={!canSave ? "يجب تحديد الورشة والفوج والحصة أولاً" : ""}>
            {saving ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="ml-2 h-4 w-4" />
            )}
            حفظ التسجيل
          </Button>
        </div>
      </div>

      {!canSave && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700 flex items-center gap-2">
          <span className="text-base">⚠️</span>
          {!isThursday
            ? "الورشات تجري يوم الخميس فقط — اختر تاريخاً يكون خميساً"
            : "يجب تحديد الورشة والفوج والحصة من فضلك قبل الحفظ"}
        </div>
      )}

      {/* Filters */}
      <Card className="border-2 border-primary/15 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-sm">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10">
              <Search className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="text-base font-bold text-primary">عناصر البحث</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
                <span className="text-base">📅</span>التاريخ
                <span className="text-xs text-muted-foreground font-normal">(الخميس فقط)</span>
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`h-11 text-sm border-2 ${isThursday ? "border-primary/15 focus:border-primary" : "border-amber-300 focus:border-amber-500"} bg-background shadow-sm`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
                <span className="text-base">🔨</span>الورشة
              </label>
              <select
                value={selectedWorkshop}
                onChange={(e) => setSelectedWorkshop(e.target.value)}
                className="flex h-11 w-full items-center rounded-lg border-2 border-primary/15 bg-background px-3 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none"
              >
                <option value="الكل">الكل</option>
                {WORKSHOPS.map((w) => (
                  <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
                <span className="text-base">👥</span>الفوج
              </label>
              <select
                value={selectedCohort === 0 ? "الكل" : String(selectedCohort)}
                onChange={(e) => {
                  if (e.target.value === "الكل") { setSelectedCohort(0); return; }
                  setSelectedCohort(Number(e.target.value));
                }}
                className="flex h-11 w-full items-center rounded-lg border-2 border-primary/15 bg-background px-3 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none"
              >
                <option value="الكل">الكل</option>
                {COHORTS.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
                <span className="text-base">⏰</span>الحصة
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="flex h-11 w-full items-center rounded-lg border-2 border-primary/15 bg-background px-3 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none"
              >
                <option value="الكل">الكل</option>
                <option value="MORNING">صباحية</option>
                <option value="AFTERNOON">مسائية</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
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
        </CardContent>
      </Card>

      {/* Stats + Bulk Actions */}
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الحاضرون</CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الغائبون</CardTitle>
              <X className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المتأخرون</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المجموع</CardTitle>
              <CheckCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{currentStudents.length}</div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="success"
            size="lg"
            onClick={markAllPresent}
            className="w-full sm:w-auto px-10 py-3 text-base"
          >
            <CheckCheck className="ml-2 h-5 w-5" />
            الجميع حاضرون
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={markAllAbsent}
            className="w-full sm:w-auto px-10 py-3 text-base"
          >
            <XCircle className="ml-2 h-5 w-5" />
            الجميع غائبون
          </Button>
        </div>
      </div>

      {/* Attendance table */}
      <div className="print-only">
        <div className="hidden print:block text-center mb-4">
          <h2 className="text-xl font-bold">كشف الحضور والغياب</h2>
          <p className="text-sm text-muted-foreground">
            طلبة التدرج المهني - بوجدور | التاريخ: {selectedDate} | الورشة: {workshopName} | الحصة: {selectedSession === "MORNING" ? "صباحية" : selectedSession === "AFTERNOON" ? "مسائية" : "جميع الحصص"} | الفوج: {selectedCohort === 0 ? "جميع الأفواج" : `الفوج ${selectedCohort}`}
          </p>
        </div>
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
                <TableHead className="text-center font-bold">تسجيل الحضور</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    لا توجد نتائج
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, index) => (
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
                      <span className={`inline-flex items-center justify-center min-w-[80px] h-8 rounded-lg text-sm font-bold border ${getStatusColor(attendance[student.id])}`}>
                        {getStatusText(attendance[student.id])}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => updateStatus(student.id, "PRESENT")}
                          className={`h-8 w-8 p-0 ${
                            attendance[student.id] === "PRESENT"
                              ? "bg-green-100 text-green-700 ring-2 ring-green-300 hover:bg-green-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                          title="حاضر"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(student.id, "ABSENT")}
                          className={`h-8 w-8 p-0 ${
                            attendance[student.id] === "ABSENT"
                              ? "bg-red-100 text-red-700 ring-2 ring-red-300 hover:bg-red-100"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                          title="غائب"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(student.id, "LATE")}
                          className={`h-8 w-8 p-0 ${
                            attendance[student.id] === "LATE"
                              ? "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300 hover:bg-yellow-100"
                              : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                          }`}
                          title="متأخر"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        </div>
      </div>

      {/* Progress */}
      <div className="text-sm text-muted-foreground">
        {(() => {
          const visiblePresent = filteredStudents.filter((s) => attendance[s.id] === "PRESENT").length;
          const visibleAbsent = filteredStudents.filter((s) => attendance[s.id] === "ABSENT").length;
          const visibleLate = filteredStudents.filter((s) => attendance[s.id] === "LATE").length;
          return `تم تسجيل ${visiblePresent + visibleAbsent + visibleLate} من ${filteredStudents.length} متدرب${
            filteredStudents.length !== currentStudents.length ? " (المعروض)" : ""
          }`;
        })()}
      </div>

      {/* Bottom save button */}
      <div className="flex justify-center">
        <Button variant="success" onClick={handleSave} disabled={saving || !canSave} title={!canSave ? "يجب تحديد الورشة والفوج والحصة أولاً" : ""} className="px-10 py-3 text-base">
          {saving ? (
            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
          ) : (
            <Save className="ml-2 h-5 w-5" />
          )}
          حفظ التسجيل
        </Button>
      </div>
    </div>
  );
}
