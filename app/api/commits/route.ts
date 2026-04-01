import { getCoregitClient } from "@/lib/coregit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const coregit = getCoregitClient();
  const result = await coregit.commits.list(slug, { limit: 50 });

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data);
}
