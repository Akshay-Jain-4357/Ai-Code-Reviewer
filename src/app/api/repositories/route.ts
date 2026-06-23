import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET() {
  try {
    await dbService.init();
    const repos = await dbService.repositories.findMany();
    return NextResponse.json(repos);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, provider } = body;
    await dbService.init();
    const repo = await dbService.repositories.create({ name, provider });
    return NextResponse.json(repo);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, isActive, customRules } = body;
    await dbService.init();
    const repo = await dbService.repositories.update(id, { isActive, customRules });
    return NextResponse.json(repo);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
