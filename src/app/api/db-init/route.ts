import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function POST() {
  await dbService.init();
  return NextResponse.json({ success: true });
}
