import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, details } = body;
    await dbService.init();
    const log = await dbService.auditLogs.create(action, details);
    return NextResponse.json(log);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
