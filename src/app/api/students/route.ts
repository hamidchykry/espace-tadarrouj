import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    if (!(await getStaffSession())) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const specialization = searchParams.get("specialization") || "";
    const cohort = searchParams.get("cohort") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { registrationNo: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (specialization && specialization !== "الكل") {
      where.specialization = specialization;
    }

    if (cohort && cohort !== "الكل") {
      where.cohort = parseInt(cohort);
    }

    const students = await db.student.findMany({
      where,
      orderBy: { registrationNo: "asc" },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "خطأ في جلب البيانات" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await getStaffSession())) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { registrationNo, firstName, lastName, gender, dateOfBirth, birthPlace, phone, specialization, cohort, photo } = body;

    if (!registrationNo || !firstName || !lastName || !specialization || !cohort) {
      return NextResponse.json({ error: "يرجى ملء جميع الحقول المطلوبة" }, { status: 400 });
    }

    const existing = await db.student.findUnique({ where: { registrationNo } });
    if (existing) {
      return NextResponse.json({ error: "رقم التسجيل موجود مسبقاً" }, { status: 409 });
    }

    const student = await db.student.create({
      data: {
        registrationNo,
        firstName,
        lastName,
        gender: gender || "F",
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        birthPlace,
        phone,
        specialization,
        cohort: parseInt(cohort),
        photo: photo || null,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "خطأ في إنشاء الطالب" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await getStaffSession())) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, data } = body;
    if (!Array.isArray(ids) || ids.length === 0 || !data || typeof data !== "object") {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    const updatable: Record<string, unknown> = {};
    if (data.cohort != null) updatable.cohort = parseInt(data.cohort);
    if (data.photo !== undefined) updatable.photo = data.photo;
    if (data.status !== undefined) updatable.status = data.status;

    if (Object.keys(updatable).length === 0) {
      return NextResponse.json({ error: "لا توجد بيانات للتعديل" }, { status: 400 });
    }

    const result = await db.student.updateMany({
      where: { id: { in: ids } },
      data: updatable,
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("Error updating students:", error);
    return NextResponse.json({ error: "خطأ في التعديل" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await getStaffSession())) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.student.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: "خطأ في الحذف" }, { status: 500 });
  }
}
