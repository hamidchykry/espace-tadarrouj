import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    if (!(await getStaffSession())) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const workshopId = searchParams.get("workshopId");
    const type = searchParams.get("type");

    const where: Record<string, unknown> = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (workshopId && workshopId !== "الكل") {
      where.workshopId = workshopId;
    }

    if (type && type !== "الكل") {
      where.type = type.toUpperCase();
    }

    const grades = await db.grade.findMany({
      where,
      include: {
        student: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(grades);
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "خطأ في جلب البيانات" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await getStaffSession())) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, workshopId, type, score, maxScore, notes } = body;

    if (!studentId || !workshopId || !type || score === undefined) {
      return NextResponse.json(
        { error: "يرجى ملء جميع الحقول المطلوبة" },
        { status: 400 }
      );
    }

    const numericScore = parseFloat(score);

    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 20) {
      return NextResponse.json(
        { error: "النقطة يجب أن تكون بين 0 و 20" },
        { status: 400 }
      );
    }

    const grade = await db.grade.create({
      data: {
        studentId,
        workshopId,
        type: type.toUpperCase(),
        score: numericScore,
        maxScore: maxScore ? parseFloat(maxScore) : 20,
        notes,
      },
    });

    return NextResponse.json(grade, { status: 201 });
  } catch (error) {
    console.error("Error creating grade:", error);
    return NextResponse.json(
      { error: "خطأ في إنشاء التقييم" },
      { status: 500 }
    );
  }
}
