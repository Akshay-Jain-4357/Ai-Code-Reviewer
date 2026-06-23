import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET() {
  try {
    await dbService.init();
    const providers = await dbService.aiProviders.findMany();
    return NextResponse.json(providers);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, isActive, isFallback, modelName, apiKeySecure } = body;
    await dbService.init();
    const provider = await dbService.aiProviders.update(id, { isActive, isFallback, modelName, apiKeySecure });
    return NextResponse.json(provider);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
