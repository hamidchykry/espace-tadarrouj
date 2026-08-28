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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  GraduationCap,
  Loader2,
  ArrowLeftRight,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Student {
  id: string;
  registrationNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string | null;
  birthPlace: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  specialization: string;
  cohort: number;
  status: string;
  enrollmentDate: string;
  photo?: string | null;
}

const ITEMS_PER_PAGE = 15;

const COHORTS = [
  { id: 1, name: "الفوج الأول" },
  { id: 2, name: "الفوج الثاني" },
  { id: 3, name: "الفوج الثالث" },
  { id: 4, name: "الفوج الرابع" },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterSpecialization, setFilterSpecialization] = useState("الكل");
  const [filterCohort, setFilterCohort] = useState("الكل");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [moveCohort, setMoveCohort] = useState("1");
  const [moving, setMoving] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (filterSpecialization !== "الكل") params.set("specialization", filterSpecialization);
        if (filterCohort !== "الكل") params.set("cohort", filterCohort);

        const res = await fetch(`/api/students?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) {
          setStudents(data);
          setCurrentPage(1);
        }
      } catch {
        if (!cancelled) toast.error("خطأ في جلب بيانات الطلبة");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [searchQuery, filterSpecialization, filterCohort]);

  const reloadStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (filterSpecialization !== "الكل") params.set("specialization", filterSpecialization);
      if (filterCohort !== "الكل") params.set("cohort", filterCohort);

      const res = await fetch(`/api/students?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStudents(data);
    } catch {
      toast.error("خطأ في جلب بيانات الطلبة");
    }
  };

  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
  const paginatedStudents = students.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = {
    total: students.length,
    female: students.filter((s) => s.gender === "F").length,
    male: students.filter((s) => s.gender === "M").length,
  };

  const handleExport = () => {
    const csv = [
      ["رقم التسجيل", "الاسم", "اللقب", "الجنس", "تاريخ الميلاد", "مكان الميلاد", "الهاتف", "التخصص", "الفوج"].join(","),
      ...students.map((s) =>
        [
          s.registrationNo,
          s.firstName,
          s.lastName,
          s.gender === "F" ? "أنثى" : "ذكر",
          s.dateOfBirth || "",
          s.birthPlace || "",
          s.phone || "",
          s.specialization === "textile" ? "نسيج" : "جلد",
          `الفوج ${s.cohort}`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\u200B" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "قائمة_الطلبة.csv";
    link.click();
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/students?id=${selectedStudent.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("تم حذف الطالب بنجاح");
        setIsDeleteDialogOpen(false);
        reloadStudents();
      } else {
        toast.error("خطأ في الحذف");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setDeleting(false);
    }
  };

  const handleBatchMove = async () => {
    if (selectedIds.size === 0) return;
    setMoving(true);
    try {
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selectedIds], data: { cohort: moveCohort } }),
      });
      if (res.ok) {
        toast.success(`تم نقل ${selectedIds.size} متدرب بنجاح`);
        setIsMoveDialogOpen(false);
        setSelectedIds(new Set());
        reloadStudents();
      } else {
        const data = await res.json();
        toast.error(data.error || "خطأ في النقل");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setMoving(false);
    }
  };

  const openPhotoDialog = (student: Student) => {
    setSelectedStudent(student);
    setPhotoFile("");
    setIsPhotoDialogOpen(true);
  };

  const handlePhotoSave = async () => {
    if (!selectedStudent || !photoFile) return;
    try {
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [selectedStudent.id], data: { photo: photoFile } }),
      });
      if (res.ok) {
        toast.success("تم تحديث الصورة بنجاح");
        setIsPhotoDialogOpen(false);
        reloadStudents();
      } else {
        toast.error("خطأ في تحديث الصورة");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            إدارة الطلبة
          </h1>
          <p className="text-muted-foreground mt-1">
            طلبة التدرج المهني ({stats.total} متدرب)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="info" onClick={handleExport}>
            <Download className="ml-2 h-4 w-4" />
            تصدير القائمة
          </Button>
          <Button
            variant="warning"
            onClick={() => setIsMoveDialogOpen(true)}
            disabled={selectedIds.size === 0}
            title={selectedIds.size === 0 ? "حدد الطلبة أولاً لنقل فوجهم" : `نقل ${selectedIds.size} متدرب`}
          >
            <ArrowLeftRight className="ml-2 h-4 w-4" />
            نقل فوج ({selectedIds.size})
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger render={<Button variant="success" />}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة طالب
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إضافة طالب جديد</DialogTitle>
              </DialogHeader>
              <AddStudentForm
                onSuccess={() => {
                  setIsAddDialogOpen(false);
                  reloadStudents();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-sm text-muted-foreground">إجمالي الطلبة</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-sm text-muted-foreground">إناث</div>
          <div className="text-2xl font-bold mt-1 text-pink-600">{stats.female}</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-sm text-muted-foreground">ذكور</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">{stats.male}</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-sm text-muted-foreground">الفوج الرابع</div>
          <div className="text-2xl font-bold mt-1 text-orange-600">
            {students.filter((s) => s.cohort === 4).length}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو رقم البطاقة الوطنية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={filterSpecialization} onValueChange={(v) => setFilterSpecialization(v ?? "الكل")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="فلتر حسب التخصص" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">جميع التخصصات</SelectItem>
            <SelectItem value="textile">النسيج</SelectItem>
            <SelectItem value="cuir">الجلد</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCohort} onValueChange={(v) => setFilterCohort(v ?? "الكل")}>
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
      </div>

      <div className="border rounded-lg">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={paginatedStudents.length > 0 && paginatedStudents.every((s) => selectedIds.has(s.id))}
                  onChange={(e) => {
                    const next = new Set(selectedIds);
                    if (e.target.checked) {
                      paginatedStudents.forEach((s) => next.add(s.id));
                    } else {
                      paginatedStudents.forEach((s) => next.delete(s.id));
                    }
                    setSelectedIds(next);
                  }}
                />
              </TableHead>
              <TableHead>رقم التسجيل</TableHead>
              <TableHead>الاسم الكامل</TableHead>
              <TableHead>الجنس</TableHead>
              <TableHead>التخصص</TableHead>
              <TableHead>الفوج</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  لا توجد نتائج
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((student) => (
                <TableRow key={student.id} className={selectedIds.has(student.id) ? "bg-primary/5" : ""}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={selectedIds.has(student.id)}
                      onChange={(e) => {
                        const next = new Set(selectedIds);
                        if (e.target.checked) next.add(student.id);
                        else next.delete(student.id);
                        setSelectedIds(next);
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{student.registrationNo}</TableCell>
                  <TableCell className="font-medium" title={`${student.firstName} ${student.lastName}`}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {student.photo ? (
                          <AvatarImage src={student.photo} alt={`${student.firstName} ${student.lastName}`} />
                        ) : null}
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{`${student.firstName} ${student.lastName}`}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={student.gender === "F" ? "border border-pink-200 bg-pink-100 text-pink-700" : "border border-blue-200 bg-blue-100 text-blue-700"}>
                      {student.gender === "F" ? "أنثى" : "ذكر"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.specialization === "textile" ? "default" : "outline"}>
                      {student.specialization === "textile" ? "نسيج" : "جلد"}
                    </Badge>
                  </TableCell>
                  <TableCell>الفوج {student.cohort}</TableCell>
                  <TableCell className="text-sm" dir="ltr">
                    {student.phone || "غير متوفر"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="default" size="icon" className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100" />}>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedStudent(student); setIsViewDialogOpen(true); }}>
                          <Eye className="ml-2 h-4 w-4" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedStudent(student); openPhotoDialog(student); }}>
                          <Avatar className="h-4 w-4 rounded-sm"><AvatarFallback className="text-[10px]">ص</AvatarFallback></Avatar>
                          تغيير الصورة
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedStudent(student); setIsDeleteDialogOpen(true); }}>
                          <Trash2 className="ml-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          عرض {Math.min(currentPage * ITEMS_PER_PAGE, students.length)} من {students.length} متدرب
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm px-4">
            الصفحة {currentPage} / {totalPages || 1}
          </span>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل الطالب</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex justify-center">
                {selectedStudent.photo ? (
                  <img
                    src={selectedStudent.photo}
                    alt={selectedStudent.firstName}
                    className="h-24 w-24 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {selectedStudent.firstName.charAt(0)}{selectedStudent.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div><div className="text-sm text-muted-foreground">رقم التسجيل</div><div className="font-mono">{selectedStudent.registrationNo}</div></div>
              <div><div className="text-sm text-muted-foreground">الاسم</div><div className="font-medium">{selectedStudent.firstName} {selectedStudent.lastName}</div></div>
              <div><div className="text-sm text-muted-foreground">الجنس</div><div className={selectedStudent.gender === "F" ? "font-medium text-pink-600" : "font-medium text-blue-600"}>{selectedStudent.gender === "F" ? "أنثى" : "ذكر"}</div></div>
              <div><div className="text-sm text-muted-foreground">تاريخ الميلاد</div><div>{selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString("ar-MA") : "-"}</div></div>
              <div><div className="text-sm text-muted-foreground">مكان الميلاد</div><div>{selectedStudent.birthPlace || "-"}</div></div>
              <div><div className="text-sm text-muted-foreground">الهاتف</div><div dir="ltr">{selectedStudent.phone || "غير متوفر"}</div></div>
              <div><div className="text-sm text-muted-foreground">التخصص</div><Badge variant={selectedStudent.specialization === "textile" ? "default" : "outline"}>{selectedStudent.specialization === "textile" ? "نسيج" : "جلد"}</Badge></div>
              <div><div className="text-sm text-muted-foreground">الفوج</div><div>الفوج {selectedStudent.cohort}</div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p>هل أنت متأكد من حذف الطالب <span className="font-medium">{selectedStudent?.firstName} {selectedStudent?.lastName}</span>؟</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleting}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {deleting ? "جاري الحذف..." : "حذف"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>نقل المتدربين إلى فوج آخر</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            نقل <span className="font-medium text-foreground">{selectedIds.size} متدرب</span> إلى:
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">الفوج الجديد</label>
            <Select value={moveCohort} onValueChange={(v) => v && setMoveCohort(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COHORTS.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>إلغاء</Button>
            <Button variant="success" onClick={handleBatchMove} disabled={moving}>
              {moving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {moving ? "جاري النقل..." : "نقل المتدربين"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغيير صورة المتدرب</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">تحديث صورة <span className="font-medium text-foreground">{selectedStudent?.firstName} {selectedStudent?.lastName}</span></p>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {photoFile ? <AvatarImage src={photoFile} /> : null}
              <AvatarFallback className="bg-primary/10 text-primary">
                {selectedStudent?.firstName.charAt(0)}{selectedStudent?.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 1.5 * 1024 * 1024) {
                    toast.error("الصورة كبيرة — يرجى اختيار صورة أقل من 1.5MB");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => setPhotoFile(reader.result as string);
                  reader.readAsDataURL(file);
                }}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsPhotoDialogOpen(false)}>إلغاء</Button>
            <Button variant="success" onClick={handlePhotoSave} disabled={!photoFile}>حفظ الصورة</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddStudentForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    registrationNo: "", firstName: "", lastName: "", gender: "F",
    phone: "", birthPlace: "", specialization: "textile", cohort: "1",
  });
  const [photo, setPhoto] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("الصورة كبيرة — يرجى اختيار صورة أقل من 1.5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photo: photo || null }),
      });
      if (res.ok) {
        toast.success("تمت الإضافة بنجاح");
        onSuccess();
      } else {
        const data = await res.json();
        toast.error(data.error || "خطأ");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {photo ? (
            <AvatarImage src={photo} alt="صورة المستخدم" />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary">
            {form.firstName.charAt(0)}{form.lastName.charAt(0) || "؟"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <label className="text-sm font-medium block mb-2">صورة المتدرب (اختياري)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">الاسم الأول</label>
          <Input required placeholder="أدخل الاسم" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">اسم العائلة</label>
          <Input required placeholder="أدخل اللقب" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">رقم التسجيل</label>
          <Input required placeholder="BD-2026-XXX" value={form.registrationNo} onChange={(e) => setForm({ ...form, registrationNo: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الهاتف</label>
          <Input placeholder="06XXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">مكان الميلاد</label>
          <Input placeholder="بوجدور" value={form.birthPlace} onChange={(e) => setForm({ ...form, birthPlace: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الجنس</label>
          <Select value={form.gender} onValueChange={(v) => v && setForm({ ...form, gender: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="F">أنثى</SelectItem>
              <SelectItem value="M">ذكر</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">التخصص</label>
          <Select value={form.specialization} onValueChange={(v) => v && setForm({ ...form, specialization: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="textile">النسيج</SelectItem>
              <SelectItem value="cuir">الجلد</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الفوج</label>
          <Select value={form.cohort} onValueChange={(v) => v && setForm({ ...form, cohort: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">الفوج الأول</SelectItem>
              <SelectItem value="2">الفوج الثاني</SelectItem>
              <SelectItem value="3">الفوج الثالث</SelectItem>
              <SelectItem value="4">الفوج الرابع</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" variant="success" disabled={submitting}>
          {submitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          حفظ
        </Button>
      </div>
    </form>
  );
}
