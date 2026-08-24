"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, ArrowLeftRight, Users, ArrowDown } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  registrationNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  specialization: string;
  cohort: number;
}

const COHORTS = [
  { id: 1, label: "الفوج الأول", range: "1-25", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: 2, label: "الفوج الثاني", range: "26-50", color: "bg-green-100 text-green-700 border-green-200" },
  { id: 3, label: "الفوج الثالث", range: "51-75", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: 4, label: "الفوج الرابع", range: "76-113", color: "bg-amber-100 text-amber-700 border-amber-200" },
];

const COHORT_MAP = Object.fromEntries(COHORTS.map((c) => [c.id, c]));

export default function CohortsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCohort, setFilterCohort] = useState("الكل");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [swapMode, setSwapMode] = useState(false);
  const [swapSelected, setSwapSelected] = useState<Student[]>([]);
  const [swapping, setSwapping] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch("/api/students");
      if (res.ok) {
        setStudents(await res.json());
      }
    } catch {
      toast.error("خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/students");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setStudents(data);
        }
      } catch {
        if (!cancelled) toast.error("خطأ في جلب البيانات");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const cohortCounts = COHORTS.map((c) => ({
    ...c,
    count: students.filter((s) => s.cohort === c.id).length,
  }));

  const filtered = students.filter((s) => {
    const matchSearch =
      !search ||
      s.firstName.includes(search) ||
      s.lastName.includes(search) ||
      s.registrationNo.includes(search);
    const matchCohort = filterCohort === "الكل" || s.cohort === parseInt(filterCohort);
    return matchSearch && matchCohort;
  });

  const handleChangeCohort = async (studentId: string, newCohort: number) => {
    setUpdatingId(studentId);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cohort: newCohort }),
      });
      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, cohort: newCohort } : s))
        );
        toast.success("تم تحديث الفوج بنجاح");
      } else {
        const data = await res.json();
        toast.error(data.error || "خطأ في التحديث");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSwapToggle = (student: Student) => {
    setSwapSelected((prev) => {
      const exists = prev.find((s) => s.id === student.id);
      if (exists) return prev.filter((s) => s.id !== student.id);
      if (prev.length >= 2) return [prev[1], student];
      return [...prev, student];
    });
  };

  const handleSwap = async () => {
    if (swapSelected.length !== 2) return;
    setSwapping(true);
    try {
      const res = await fetch("/api/students/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId1: swapSelected[0].id, studentId2: swapSelected[1].id }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(
          `تم التبادل: ${data.student1.name} → الفوج ${data.student1.newCohort} | ${data.student2.name} → الفوج ${data.student2.newCohort}`
        );
        setSwapSelected([]);
        setSwapMode(false);
        fetchStudents();
      } else {
        const data = await res.json();
        toast.error(data.error || "خطأ في التبادل");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSwapping(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            إدارة الأفواج
          </h1>
          <p className="text-muted-foreground mt-1">
            نقل المتدربين بين الأفواج وتبديل الأفواج
          </p>
        </div>
        <Button
          variant={swapMode ? "destructive" : "info"}
          onClick={() => {
            setSwapMode(!swapMode);
            setSwapSelected([]);
          }}
        >
          <ArrowLeftRight className="ml-2 h-4 w-4" />
          {swapMode ? "إلغاء التبديل" : "تبديل أفواج"}
        </Button>
      </div>

      {swapMode && (
        <Card className="border-2 border-info/40 bg-info/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <ArrowLeftRight className="h-5 w-5 text-info" />
              <div className="flex-1">
                <p className="font-medium">
                  {swapSelected.length === 0 && "اختر متدربين من أفواج مختلفة للتبديل"}
                  {swapSelected.length === 1 && `المتدرب الأول: ${swapSelected[0].firstName} ${swapSelected[0].lastName} (الفوج ${swapSelected[0].cohort}) — اختر المتدرب الثاني`}
                  {swapSelected.length === 2 && `المتدرب الأول: ${swapSelected[0].firstName} ${swapSelected[0].lastName} (الفوج ${swapSelected[0].cohort}) ↔ المتدرب الثاني: ${swapSelected[1].firstName} ${swapSelected[1].lastName} (الفوج ${swapSelected[1].cohort})`}
                </p>
              </div>
              <Button
                variant="info"
                disabled={swapSelected.length !== 2 || swapping}
                onClick={handleSwap}
              >
                {swapping ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ArrowLeftRight className="ml-2 h-4 w-4" />}
                تبديل
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {cohortCounts.map((c) => (
          <Card
            key={c.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setFilterCohort(filterCohort === String(c.id) ? "الكل" : String(c.id))}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
              <Badge className={c.color}>{c.count} متدرب</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.count}</div>
              <p className="text-xs text-muted-foreground mt-1">الفوج {c.range}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو رقم التسجيل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={filterCohort} onValueChange={(v) => setFilterCohort(v ?? "الكل")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="فلتر حسب الفوج" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">جميع الأفواج</SelectItem>
            {COHORTS.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12 text-center font-bold">الر.ت</TableHead>
              <TableHead className="font-bold">رقم التسجيل</TableHead>
              <TableHead className="font-bold">اسم المتدرب</TableHead>
              <TableHead className="text-center font-bold">الجنس</TableHead>
              <TableHead className="text-center font-bold">التخصص</TableHead>
              <TableHead className="text-center font-bold">الفوج الحالي</TableHead>
              <TableHead className="text-center font-bold">الفوج الجديد</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  لا توجد نتائج
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((student, index) => {
                const cohortInfo = COHORT_MAP[student.cohort];
                return (
                  <TableRow
                    key={student.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}
                  >
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-primary/10 text-primary">
                        {student.registrationNo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium" title={`${student.firstName} ${student.lastName}`}>
                        {student.firstName} {student.lastName}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={student.gender === "F" ? "text-xs border border-pink-200 bg-pink-100 text-pink-700" : "text-xs border border-blue-200 bg-blue-100 text-blue-700"}>
                        {student.gender === "F" ? "أنثى" : "ذكر"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {student.specialization === "textile" ? "نسيج" : "جلد"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cohortInfo?.color || ""}>
                        {cohortInfo?.label || `الفوج ${student.cohort}`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {swapMode ? (
                        <Button
                          variant={swapSelected.some((s) => s.id === student.id) ? "info" : "outline"}
                          size="sm"
                          onClick={() => handleSwapToggle(student)}
                          className={swapSelected.some((s) => s.id === student.id) ? "ring-2 ring-info/40" : ""}
                        >
                          {swapSelected.some((s) => s.id === student.id) ? (
                            "محدد"
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                        </Button>
                      ) : (
                        <Select
                          value={String(student.cohort)}
                          onValueChange={(v) => v && handleChangeCohort(student.id, parseInt(v))}
                          disabled={updatingId === student.id}
                        >
                          <SelectTrigger className="w-32 mx-auto h-8 text-xs">
                            <SelectValue />
                            {updatingId === student.id && <Loader2 className="h-3 w-3 animate-spin" />}
                          </SelectTrigger>
                          <SelectContent>
                            {COHORTS.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
