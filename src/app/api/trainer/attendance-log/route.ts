import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "TRAINER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user?.workshopId) {
      return NextResponse.json({ error: "ورشة غير محددة" }, { status: 400 });
    }

    const logs = await db.attendanceLog.findMany({
      where: { userId: session.userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "خطأ في جلب البيانات" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TRAINER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user?.workshopId) {
      return NextResponse.json({ error: "ورشة غير محددة" }, { status: 400 });
    }

    const body = await request.json();
    const { date, cohort, workshopName, presentCount, absentCount, lateCount, totalCount } = body;

    const log = await db.attendanceLog.create({
      data: {
        date: new Date(date),
        cohort,
        workshopId: user.workshopId,
        workshopName,
        presentCount,
        absentCount,
        lateCount,
        totalCount,
        userId: session.userId,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Error creating log:", error);
    return NextResponse.json({ error: "خطأ في الحفظ" }, { status: 500 });
  }
}
