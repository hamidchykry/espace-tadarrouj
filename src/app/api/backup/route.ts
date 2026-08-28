import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getStaffSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const [students, workshops, users, attendances, grades, settings] = await Promise.all([
      db.student.findMany(),
      db.workshop.findMany(),
      db.user.findMany({ select: { id: true, email: true, name: true, role: true, workshopId: true, phone: true } }),
      db.attendance.findMany(),
      db.grade.findMany(),
      db.setting.findMany(),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      database: "student_management",
      data: {
        students,
        workshops,
        users,
        attendances,
        grades,
        settings,
      },
      counts: {
        students: students.length,
        workshops: workshops.length,
        users: users.length,
        attendances: attendances.length,
        grades: grades.length,
        settings: settings.length,
      },
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error creating backup:", error);
    return NextResponse.json({ error: "خطأ في إنشاء النسخة الاحتياطية" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getStaffSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const backup = await request.json();

    if (!backup?.data?.students || !Array.isArray(backup.data.students)) {
      return NextResponse.json({ error: "ملف نسخة احتياطية غير صالح" }, { status: 400 });
    }

    const { students, settings } = backup.data;

    const result = await db.$transaction(async (tx) => {
      for (const s of students) {
        await tx.student.upsert({
          where: { id: s.id },
          update: {
            registrationNo: s.registrationNo,
            firstName: s.firstName,
            lastName: s.lastName,
            gender: s.gender,
            dateOfBirth: s.dateOfBirth ? new Date(s.dateOfBirth) : null,
            birthPlace: s.birthPlace,
            phone: s.phone,
            email: s.email,
            address: s.address,
            specialization: s.specialization,
            cohort: s.cohort,
            status: s.status,
            photo: s.photo,
          },
          create: { ...s, dateOfBirth: s.dateOfBirth ? new Date(s.dateOfBirth) : null },
        });
      }

      if (Array.isArray(settings)) {
        for (const setting of settings) {
          await tx.setting.upsert({
            where: { key: setting.key },
            update: { value: setting.value, category: setting.category },
            create: { key: setting.key, value: setting.value, category: setting.category },
          });
        }
      }

      return { students: students.length, settings: Array.isArray(settings) ? settings.length : 0 };
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    console.error("Error restoring backup:", error);
    return NextResponse.json({ error: "خطأ في استعادة النسخة الاحتياطية" }, { status: 500 });
  }
}
