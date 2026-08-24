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
        { error: "خطأ في الاتصال بقاعدة البيانات", detail: String(dbError) },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "البريد الإلكتروني غير صحيح" },
        { status: 401 }
      );
    }

    const isValid = password === "admin123";

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
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "خطأ في الخادم", detail: String(error) },
      { status: 500 }
    );
  }
}
