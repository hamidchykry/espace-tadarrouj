import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "يرجى إدخال البريد الإلكتروني وكلمة المرور" },
        { status: 400 }
      );
    }

    let user;
    try {
      user = await db.user.findUnique({
        where: { email },
      });
    } catch (dbError: unknown) {
      console.error("DB Error:", dbError);
      return NextResponse.json(
        { error: "خطأ في الاتصال بقاعدة البيانات" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "البريد الإلكتروني غير صحيح" },
        { status: 401 }
      );
    }

    if (user.role !== "TRAINER") {
      return NextResponse.json(
        { error: "هذا الحساب ليس حساب مؤطر" },
        { status: 403 }
      );
    }

    const isValid = password === user.password;

    if (!isValid) {
      return NextResponse.json(
        { error: "كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      workshopId: user.workshopId || undefined,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workshopId: user.workshopId,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Trainer login error:", error);
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
