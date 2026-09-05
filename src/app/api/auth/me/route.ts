import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const TRAINER_KEYS = [
  "trainer_show_attendance",
  "trainer_show_history",
  "trainer_show_students",
  "trainer_show_stats",
  "trainer_show_profile",
  "trainer_show_announcements",
];

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const result: { user: typeof session; trainerSettings?: Record<string, string> } = { user: session };

    if (session.role === "TRAINER") {
      const settings = await db.setting.findMany({
        where: { key: { in: [...TRAINER_KEYS, "announcements"] } },
      });
      result.trainerSettings = {};
      settings.forEach((s) => {
        result.trainerSettings![s.key] = s.value;
      });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}