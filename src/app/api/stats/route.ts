import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await getStaffSession())) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const totalStudents = await db.student.count();
    const femaleStudents = await db.student.count({ where: { gender: "F" } });
    const maleStudents = await db.student.count({ where: { gender: "M" } });
    const textileStudents = await db.student.count({ where: { specialization: "textile" } });
    const cuirStudents = await db.student.count({ where: { specialization: "cuir" } });

    const cohorts = await db.student.groupBy({
      by: ["cohort"],
      _count: true,
    });

    const workshops = await db.workshop.findMany();

    // Get attendance stats for today (records stored as UTC midnight of the selected date)
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const todayStart = new Date(`${todayStr}T00:00:00Z`);
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const todayAttendance = await db.attendance.groupBy({
      by: ["status"],
      where: {
        date: { gte: todayStart, lt: todayEnd },
      },
      _count: true,
    });

    const presentToday = todayAttendance.find((a) => a.status === "PRESENT")?._count || 0;
    const absentToday = todayAttendance.find((a) => a.status === "ABSENT")?._count || 0;
    const lateToday = todayAttendance.find((a) => a.status === "LATE")?._count || 0;

    // Get recent attendance
    const recentAttendance = await db.attendance.findMany({
      take: 10,
      include: {
        student: true,
        workshop: true,
      },
      orderBy: { date: "desc" },
    });

    // Get grade stats
    const gradeStats = await db.grade.aggregate({
      _avg: { score: true },
      _max: { score: true },
      _min: { score: true },
      _count: true,
    });

    return NextResponse.json({
      students: {
        total: totalStudents,
        female: femaleStudents,
        male: maleStudents,
        textile: textileStudents,
        cuir: cuirStudents,
      },
      cohorts: cohorts.map((c) => ({
        id: c.cohort,
        count: c._count,
      })),
      workshops,
      attendance: {
        present: presentToday,
        absent: absentToday,
        late: lateToday,
      },
      grades: {
        average: gradeStats._avg.score,
        highest: gradeStats._max.score,
        lowest: gradeStats._min.score,
        total: gradeStats._count,
      },
      recentAttendance,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "خطأ في جلب الإحصائيات" },
      { status: 500 }
    );
  }
}
