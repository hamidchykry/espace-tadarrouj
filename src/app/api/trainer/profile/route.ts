import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "TRAINER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, phone: true, workshopId: true, createdAt: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "خطأ في جلب البيانات" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TRAINER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, currentPassword, newPassword } = body;

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 404 });
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "أدخل كلمة المرور الحالية" }, { status: 400 });
      }
      if (currentPassword !== user.password) {
        return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "كلمة المرور الجديدة قصيرة جداً (6 أحرف على الأقل)" }, { status: 400 });
      }
    }

    const updated = await db.user.update({
      where: { id: session.userId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(newPassword && { password: newPassword }),
      },
      select: { id: true, name: true, email: true, phone: true, workshopId: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "خطأ في التحديث" }, { status: 500 });
  }
}
