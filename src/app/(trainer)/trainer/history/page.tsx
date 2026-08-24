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
  Clock,
  Download,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface AttendanceLog {
  id: string;
  date: string;
  cohort: number;
  workshopName: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalCount: number;
  createdAt: string;
}

export default function TrainerHistoryPage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCohort, setFilterCohort] = useState("الكل");

  useEffect(() => {
    fetch("/api/trainer/attendance-log")
      .then((r) => r.json())
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      !searchQuery ||
      new Date(log.date).toLocaleDateString("ar-MA").includes(searchQuery) ||
      `الفوج ${log.cohort}`.includes(searchQuery);
    const matchCohort = filterCohort === "الكل" || String(log.cohort) === filterCohort;
    return matchSearch && matchCohort;
  });

  const totalPresent = filteredLogs.reduce((sum, l) => sum + l.presentCount, 0);
  const totalAbsent = filteredLogs.reduce((sum, l) => sum + l.absentCount, 0);
  const totalLate = filteredLogs.reduce((sum, l) => sum + l.lateCount, 0);

  const handleExportCSV = () => {
    const csv = [
      ["التاريخ", "الفوج", "الحاضرون", "الغائبون", "المتأخرون", "المجموع"].join(","),
      ...filteredLogs.map((l) =>
        [
          new Date(l.date).toLocaleDateString("ar-MA"),
          `الفوج ${l.cohort}`,
          l.presentCount,
          l.absentCount,
          l.lateCount,
          l.totalCount,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\u200B" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "سجل_الحضور.csv";
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
            <Clock className="h-7 w-7 text-primary" />
            سجل الحضور
          </h1>
          <p className="text-muted-foreground mt-1">عرض سجلات الحضور السابقة</p>
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
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
                <p className="text-xs text-muted-foreground">إجمالي الحضور</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{totalAbsent}</p>
                <p className="text-xs text-muted-foreground">إجمالي الغياب</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{totalLate}</p>
                <p className="text-xs text-muted-foreground">إجمالي التأخر</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث بالتاريخ أو الفوج..."
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
                <TableHead className="font-bold">التاريخ</TableHead>
                <TableHead className="text-center font-bold">الفوج</TableHead>
                <TableHead className="text-center font-bold">الحاضرون</TableHead>
                <TableHead className="text-center font-bold">الغائبون</TableHead>
                <TableHead className="text-center font-bold">المتأخرون</TableHead>
                <TableHead className="text-center font-bold">المجموع</TableHead>
                <TableHead className="text-center font-bold">النسبة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>لا توجد سجلات بعد</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log, index) => {
                  const rate =
                    log.totalCount > 0
                      ? ((log.presentCount / log.totalCount) * 100).toFixed(1)
                      : "0";
                  return (
                    <TableRow
                      key={log.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}
                    >
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(log.date).toLocaleDateString("ar-MA")}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">الفوج {log.cohort}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-medium">{log.presentCount}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-red-600 font-medium">{log.absentCount}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-yellow-600 font-medium">{log.lateCount}</span>
                      </TableCell>
                      <TableCell className="text-center font-medium">{log.totalCount}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            Number(rate) >= 80
                              ? "bg-green-100 text-green-800"
                              : Number(rate) >= 50
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {rate}%
                        </Badge>
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
