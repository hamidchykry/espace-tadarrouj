import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await getStaffSession())) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { cohort } = body;

    if (cohort === undefined || cohort === null) {
      return NextResponse.json({ error: "يرجى تحديد الفوج الجديد" }, { status: 400 });
    }

    const cohortNum = parseInt(cohort);
    if (isNaN(cohortNum) || cohortNum < 1 || cohortNum > 4) {
      return NextResponse.json({ error: "رقم الفوج غير صحيح (1-4)" }, { status: 400 });
    }

    const student = await db.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: "المتدرب غير موجود" }, { status: 404 });
    }

    const updated = await db.student.update({
      where: { id },
      data: { cohort: cohortNum },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "خطأ في تحديث الفوج" }, { status: 500 });
  }
}
