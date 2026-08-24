import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    if (!(await getStaffSession())) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId1, studentId2 } = body;

    if (!studentId1 || !studentId2) {
      return NextResponse.json({ error: "يرجى تحديد المتدربين" }, { status: 400 });
    }

    if (studentId1 === studentId2) {
      return NextResponse.json({ error: "لا يمكن التبادل مع نفس المتدرب" }, { status: 400 });
    }

    const [student1, student2] = await Promise.all([
      db.student.findUnique({ where: { id: studentId1 } }),
      db.student.findUnique({ where: { id: studentId2 } }),
    ]);

    if (!student1 || !student2) {
      return NextResponse.json({ error: "أحد المتدربين غير موجود" }, { status: 404 });
    }

    const tempCohort = student1.cohort;
    await db.$transaction([
      db.student.update({ where: { id: studentId1 }, data: { cohort: student2.cohort } }),
      db.student.update({ where: { id: studentId2 }, data: { cohort: tempCohort } }),
    ]);

    return NextResponse.json({
      success: true,
      student1: { name: `${student1.firstName} ${student1.lastName}`, newCohort: student2.cohort },
      student2: { name: `${student2.firstName} ${student2.lastName}`, newCohort: tempCohort },
    });
  } catch (error) {
    console.error("Error swapping students:", error);
    return NextResponse.json({ error: "خطأ في التبادل" }, { status: 500 });
  }
}
