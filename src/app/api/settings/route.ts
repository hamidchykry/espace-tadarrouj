import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await getStaffSession())) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const settings = await db.setting.findMany({
      orderBy: { key: "asc" },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "خطأ في جلب الإعدادات" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await getStaffSession())) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    const updates = Object.entries(settings).map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value), category: "general" },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "خطأ في حفظ الإعدادات" }, { status: 500 });
  }
}
