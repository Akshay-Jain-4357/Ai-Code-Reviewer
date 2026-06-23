import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await dbService.init();
    
    if (id) {
      const pr = await dbService.pullRequests.findUnique(id);
      if (!pr) {
        return NextResponse.json({ error: "Pull Request not found" }, { status: 404 });
      }
      return NextResponse.json(pr);
    }
    
    const prs = await dbService.pullRequests.findMany();
    return NextResponse.json(prs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
