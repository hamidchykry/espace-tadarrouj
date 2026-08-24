import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    if (!(await getStaffSession())) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const workshop = searchParams.get("workshop");
    const cohort = searchParams.get("cohort");
    const session = searchParams.get("session");

    const where: Record<string, unknown> = {};

    if (date) {
      where.date = new Date(date);
    }

    if (workshop && workshop !== "الكل") {
      where.workshopId = workshop;
    }

    if (cohort && cohort !== "الكل") {
      where.student = { cohort: parseInt(cohort) };
    }

    if (session && session !== "الكل") {
      where.session = session.toUpperCase();
    }

    const attendance = await db.attendance.findMany({
      where,
      include: {
        student: true,
        workshop: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
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
    const { date, session, workshopId, records, userId } = body;

    if (!date || !session || !workshopId || !records) {
      return NextResponse.json(
        { error: "يرجى ملء جميع الحقول المطلوبة" },
        { status: 400 }
      );
    }

    // Create attendance records for each student
    const attendanceRecords = records.map((record: { studentId: string; status: string; notes?: string }) => ({
      date: new Date(date),
      session: session.toUpperCase(),
      workshopId,
      studentId: record.studentId,
      status: record.status.toUpperCase(),
      notes: record.notes,
      userId: userId || "system",
    }));

    // Use upsert to handle existing records
    const results = await Promise.all(
      attendanceRecords.map(async (record: { date: Date; session: string; workshopId: string; studentId: string; status: string; notes?: string; userId: string }) => {
        try {
          return await db.attendance.upsert({
            where: {
              date_session_studentId_workshopId: {
                date: record.date,
                session: record.session as "MORNING" | "AFTERNOON",
                studentId: record.studentId,
                workshopId: record.workshopId,
              },
            },
            update: {
              status: record.status as "PRESENT" | "ABSENT" | "LATE",
              notes: record.notes,
            },
            create: {
              date: record.date,
              session: record.session as "MORNING" | "AFTERNOON",
              workshopId: record.workshopId,
              studentId: record.studentId,
              status: record.status as "PRESENT" | "ABSENT" | "LATE",
              notes: record.notes,
              userId: record.userId,
            },
          });
        } catch (error) {
          console.error("Error upserting attendance:", error);
          return null;
        }
      })
    );

    return NextResponse.json({ success: true, count: results.filter(Boolean).length });
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { error: "خطأ في حفظ البيانات" },
      { status: 500 }
    );
  }
}
