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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Download,
  Phone,
  MapPin,
  Calendar,
  User,
} from "lucide-react";

interface Student {
  id: string;
  registrationNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string | null;
  phone: string | null;
  address: string | null;
  cohort: number;
  specialization: string;
}

export default function TrainerStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCohort, setFilterCohort] = useState("الكل");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      !searchQuery ||
      s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.registrationNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCohort = filterCohort === "الكل" || s.cohort === Number(filterCohort);
    return matchSearch && matchCohort;
  });

  const handleExportCSV = () => {
    const csv = [
      ["رقم التسجيل", "الاسم", "الجنس", "الفوج", "الهاتف", "العنوان"].join(","),
      ...filteredStudents.map((s) =>
        [
          s.registrationNo,
          `${s.firstName} ${s.lastName}`,
          s.gender === "F" ? "أنثى" : "ذكر",
          `الفوج ${s.cohort}`,
          s.phone || "",
          s.address || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\u200B" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "قائمة_الطلبة.csv";
    link.click();
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
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            قائمة الطلبة
          </h1>
          <p className="text-muted-foreground mt-1">
            عرض بيانات المتدربين ({filteredStudents.length} متدرب)
          </p>
        </div>
        <Button variant="info" onClick={handleExportCSV}>
          <Download className="ml-2 h-4 w-4" />
          تصدير CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                <p className="text-xs text-muted-foreground">إجمالي الطلبة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                <User className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-600">
                  {students.filter((s) => s.gender === "F").length}
                </p>
                <p className="text-xs text-muted-foreground">إناث</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {students.filter((s) => s.gender === "M").length}
                </p>
                <p className="text-xs text-muted-foreground">ذكور</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
        <Select value={filterCohort} onValueChange={(v) => setFilterCohort(v ?? "الكل")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="جميع الأفواج" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">جميع الأفواج</SelectItem>
            <SelectItem value="1">الفوج الأول</SelectItem>
            <SelectItem value="2">الفوج الثاني</SelectItem>
            <SelectItem value="3">الفوج الثالث</SelectItem>
            <SelectItem value="4">الفوج الرابع</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-center font-bold">الر.ت</TableHead>
                <TableHead className="font-bold">رقم التسجيل</TableHead>
                <TableHead className="font-bold">اسم المتدرب</TableHead>
                <TableHead className="text-center font-bold">الجنس</TableHead>
                <TableHead className="text-center font-bold">الفوج</TableHead>
                <TableHead className="text-center font-bold">الهاتف</TableHead>
                <TableHead className="text-center font-bold">التفاصيل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>لا توجد نتائج</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, index) => (
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
                      <div className="font-medium" title={`${student.firstName} ${student.lastName}`}>{student.firstName} {student.lastName}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={student.gender === "F" ? "text-xs border border-pink-200 bg-pink-100 text-pink-700" : "text-xs border border-blue-200 bg-blue-100 text-blue-700"}>
                        {student.gender === "F" ? "أنثى" : "ذكر"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        الفوج {student.cohort}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm" dir="ltr">
                      {student.phone || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
                      >
                        عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedStudent(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                  <p className="text-white/80 text-sm">{selectedStudent.registrationNo}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الجنس</p>
                  <p className={`text-sm font-medium ${selectedStudent.gender === "F" ? "text-pink-600" : "text-blue-600"}`}>
                    {selectedStudent.gender === "F" ? "أنثى" : "ذكر"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">تاريخ الميلاد</p>
                  <p className="text-sm font-medium">
                    {selectedStudent.dateOfBirth
                      ? new Date(selectedStudent.dateOfBirth).toLocaleDateString("ar-MA")
                      : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">الهاتف</p>
                  <p className="text-sm font-medium" dir="ltr">{selectedStudent.phone || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">العنوان</p>
                  <p className="text-sm font-medium">{selectedStudent.address || "-"}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => setSelectedStudent(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
