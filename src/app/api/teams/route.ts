import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET() {
  try {
    await dbService.init();
    const users = await dbService.users.findMany();
    const teams = await dbService.teams.findMany();
    return NextResponse.json({ users, teams });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
