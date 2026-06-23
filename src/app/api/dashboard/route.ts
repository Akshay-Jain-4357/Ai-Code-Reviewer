import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET() {
  try {
    await dbService.init();
    const repos = await dbService.repositories.findMany();
    const prs = await dbService.pullRequests.findMany();
    const reviews = await dbService.reviews.findMany();
    const usage = await dbService.usageLogs.findMany();
    const logs = await dbService.auditLogs.findMany();
    
    return NextResponse.json({ repos, prs, reviews, usage, logs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to load dashboard data" }, { status: 500 });
  }
}
