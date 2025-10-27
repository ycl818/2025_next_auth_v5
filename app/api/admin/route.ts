import { currentRole } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // admin only api 可以用server action似乎比較省
  const role = await currentRole();

  if (role === UserRole.ADMIN) {
    return new NextResponse(null, { status: 200 });
  }
  return new NextResponse(null, { status: 403 });
}
