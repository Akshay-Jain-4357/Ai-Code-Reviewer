import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbService.init();
    const existingUser = await dbService.users.findUnique(email);

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // Save user directly to database
    const newUser = await dbService.users.create({
      email,
      name,
      passwordHash: password, // Store directly for simple credentials match
    });

    return NextResponse.json({ success: true, user: { id: newUser.id, email: newUser.email } });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
