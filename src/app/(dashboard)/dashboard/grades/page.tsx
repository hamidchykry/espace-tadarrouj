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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, TrendingUp, TrendingDown, Award, BookOpen, Loader2 } from "lucide-react";
import { WORKSHOPS } from "@/lib/data";
import { toast } from "sonner";

interface Student {
  id: string;
  registrationNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  cohort: number;
}

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  workshop: string;
  workshopName: string;
  type: string;
  score: number;
  maxScore: number;
  date: string;
  notes: string;
}

const GRADE_TYPE_MAP: Record<string, string> = {
  EXAM: "امتحان",
  WORKSHOP: "ورشة",
  PROJECT: "مشروع",
  QUIZ: "اختبار",
};

const GRADE_TYPE_REVERSE: Record<string, string> = {
  امتحان: "EXAM",
  ورشة: "WORKSHOP",
  مشروع: "PROJECT",
  اختبار: "QUIZ",
};

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWorkshop, setFilterWorkshop] = useState("الكل");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newGrade, setNewGrade] = useState({
    studentId: "",
    workshop: "",
    type: "",
    score: "",
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/grades").then((r) => r.json()),
      fetch("/api/students").then((r) => r.json()),
    ])
      .then(([gradesData, studentsData]) => {
        if (Array.isArray(gradesData)) {
          setGrades(
            gradesData.map((g: Record<string, unknown>) => ({
              id: g.id as string,
              studentId: (g.studentId as string) || "",
              studentName: g.student
                ? `${(g.student as Record<string, string>).firstName} ${(g.student as Record<string, string>).lastName}`
                : "",
              registrationNumber: g.student
                ? (g.student as Record<string, string>).registrationNo
                : "",
              workshop: (g.workshopId as string) || "",
              workshopName:
                WORKSHOPS.find((w) => w.id === g.workshopId)?.name || "",
              type: GRADE_TYPE_MAP[(g.type as string)] || (g.type as string),
              score: g.score as number,
              maxScore: (g.maxScore as number) || 20,
              date: g.date
                ? new Date(g.date as string).toISOString().split("T")[0]
                : "",
              notes: (g.notes as string) || "",
            }))
          );
        }
        if (Array.isArray(studentsData)) {
          setStudents(studentsData);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredGrades = grades.filter(
    (g) =>
      (g.studentName.includes(searchQuery) ||
        g.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterWorkshop === "الكل" || g.workshop === filterWorkshop)
  );

  const stats = {
    total: grades.length,
    average:
      grades.length > 0
        ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1)
        : "0",
    highest: grades.length > 0 ? Math.max(...grades.map((g) => g.score)) : 0,
    lowest: grades.length > 0 ? Math.min(...grades.map((g) => g.score)) : 0,
  };

  const handleAddGrade = async () => {
    if (!newGrade.studentId || !newGrade.workshop || !newGrade.score) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const score = Number(newGrade.score);
    if (Number.isNaN(score) || score < 0 || score > 20) {
      toast.error("النقطة يجب أن تكون بين 0 و 20");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: newGrade.studentId,
          workshopId: newGrade.workshop,
          type: GRADE_TYPE_REVERSE[newGrade.type] || "EXAM",
          score,
          notes: newGrade.notes || undefined,
        }),
      });

      if (res.ok) {
        toast.success("تم إضافة التقييم بنجاح");
        setIsAddDialogOpen(false);
        setNewGrade({ studentId: "", workshop: "", type: "", score: "", notes: "" });
        // Reload grades
        const gradesRes = await fetch("/api/grades");
        const gradesData = await gradesRes.json();
        if (Array.isArray(gradesData)) {
          setGrades(
            gradesData.map((g: Record<string, unknown>) => ({
              id: g.id as string,
              studentId: (g.studentId as string) || "",
              studentName: g.student
                ? `${(g.student as Record<string, string>).firstName} ${(g.student as Record<string, string>).lastName}`
                : "",
              registrationNumber: g.student
                ? (g.student as Record<string, string>).registrationNo
                : "",
              workshop: (g.workshopId as string) || "",
              workshopName:
                WORKSHOPS.find((w) => w.id === g.workshopId)?.name || "",
              type: GRADE_TYPE_MAP[(g.type as string)] || (g.type as string),
              score: g.score as number,
              maxScore: (g.maxScore as number) || 20,
              date: g.date
                ? new Date(g.date as string).toISOString().split("T")[0]
                : "",
              notes: (g.notes as string) || "",
            }))
          );
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "خطأ في الحفظ");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setAdding(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 16) return "text-green-600";
    if (score >= 12) return "text-blue-600";
    if (score >= 10) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 16) return <Badge className="bg-green-100 text-green-700">ممتاز</Badge>;
    if (score >= 14) return <Badge className="bg-blue-100 text-blue-700">جيد جداً</Badge>;
    if (score >= 12) return <Badge className="bg-amber-100 text-amber-700">جيد</Badge>;
    if (score >= 10) return <Badge className="bg-orange-100 text-orange-700">مقبول</Badge>;
    return <Badge className="bg-red-100 text-red-700">راسب</Badge>;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Award className="h-8 w-8 text-primary" />
            التقييم والتنقيط
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة نقاط المتدربين في الورشات الأربع
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={<Button variant="info" />}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة نقطة
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة نقطة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">المتدرب</label>
                <Select
                  value={newGrade.studentId}
                  onValueChange={(v) => setNewGrade({ ...newGrade, studentId: v ?? "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المتدرب" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} - {s.registrationNo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الورشة</label>
                <Select
                  value={newGrade.workshop}
                  onValueChange={(v) => setNewGrade({ ...newGrade, workshop: v ?? "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الورشة" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKSHOPS.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.icon} {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">نوع التقييم</label>
                  <Select
                    value={newGrade.type}
                    onValueChange={(v) => setNewGrade({ ...newGrade, type: v ?? "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="امتحان">امتحان</SelectItem>
                      <SelectItem value="ورشة">ورشة</SelectItem>
                      <SelectItem value="مشروع">مشروع</SelectItem>
                      <SelectItem value="اختبار">اختبار</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">النقطة (على 20)</label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    placeholder="0-20"
                    value={newGrade.score}
                    onChange={(e) => setNewGrade({ ...newGrade, score: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ملاحظات</label>
                <Input
                  placeholder="ملاحظات اختيارية"
                  value={newGrade.notes}
                  onChange={(e) => setNewGrade({ ...newGrade, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button
                  variant="success"
                  onClick={handleAddGrade}
                  disabled={
                    adding ||
                    !newGrade.studentId ||
                    !newGrade.workshop ||
                    !newGrade.type ||
                    !newGrade.score ||
                    Number(newGrade.score) < 0 ||
                    Number(newGrade.score) > 20
                  }
                >
                  {adding ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : null}
                  حفظ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="p-4 rounded-lg border bg-card flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">إجمالي التقييمات</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-card flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">المعدل العام</div>
            <div className="text-2xl font-bold text-green-600">{stats.average}/20</div>
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-card flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Award className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">أعلى نقطة</div>
            <div className="text-2xl font-bold text-amber-600">{stats.highest}/20</div>
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-card flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">أدنى نقطة</div>
            <div className="text-2xl font-bold text-red-600">{stats.lowest}/20</div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو رقم التسجيل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
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

      {/* Grades table */}
      <div className="border rounded-lg">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم التسجيل</TableHead>
              <TableHead>اسم المتدرب</TableHead>
              <TableHead>الورشة</TableHead>
              <TableHead>نوع التقييم</TableHead>
              <TableHead>النقطة</TableHead>
              <TableHead>التقدير</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>ملاحظات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  لا توجد تقييمات بعد
                </TableCell>
              </TableRow>
            ) : (
              filteredGrades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-mono text-xs">{grade.registrationNumber}</TableCell>
                  <TableCell className="font-medium" title={grade.studentName}>{grade.studentName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{grade.workshopName}</Badge>
                  </TableCell>
                  <TableCell>{grade.type}</TableCell>
                  <TableCell>
                    <span className={`font-bold text-lg ${getScoreColor(grade.score)}`}>
                      {grade.score}
                    </span>
                    <span className="text-muted-foreground text-sm">/{grade.maxScore}</span>
                  </TableCell>
                  <TableCell>{getScoreBadge(grade.score)}</TableCell>
                  <TableCell className="text-sm">{grade.date}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{grade.notes}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        عرض {filteredGrades.length} من {grades.length} تقييم
      </div>
    </div>
  );
}
