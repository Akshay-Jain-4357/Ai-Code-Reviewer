import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET() {
  try {
    await dbService.init();
    const providers = await dbService.aiProviders.findMany();
    const logs = await dbService.auditLogs.findMany();
    return NextResponse.json({ providers, logs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
