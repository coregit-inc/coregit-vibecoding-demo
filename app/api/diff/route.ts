import { getCoregitClient } from "@/lib/coregit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const base = req.nextUrl.searchParams.get("base");
  const head = req.nextUrl.searchParams.get("head");

  if (!slug || !base || !head) {
    return NextResponse.json(
      { error: "slug, base, and head are required" },
      { status: 400 }
    );
  }

  const coregit = getCoregitClient();
  const result = await coregit.diff.compare(slug, base, head, { patch: true });

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data);
}
