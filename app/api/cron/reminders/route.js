import { NextResponse } from "next/server";
import { runEmailReminders } from "@/server/jobs/reminderScheduler.js";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runEmailReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron] reminders failed:", err);
    return NextResponse.json({ error: "Reminder job failed" }, { status: 500 });
  }
}

export async function POST(request) {
  return GET(request);
}
