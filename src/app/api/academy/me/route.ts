import { NextRequest, NextResponse } from "next/server";
import { resolveAcademyAuth } from "@/lib/academy-auth";
import { buildAthleteScope, buildParentScope } from "@/lib/academy-data";

export async function GET(req: NextRequest) {
  const auth = await resolveAcademyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const scope = auth.role === "athlete" ? await buildAthleteScope(auth.id) : await buildParentScope(auth.id);
    if (!scope) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ scope });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
