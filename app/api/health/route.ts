import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/run-seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { students, seeded } = await ensureSeeded();
    return NextResponse.json(
      { ok: true, students, seeded },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check / auto-seed failed:", error);
    return NextResponse.json(
      { ok: false, error: "Database unavailable" },
      { status: 503 }
    );
  }
}
