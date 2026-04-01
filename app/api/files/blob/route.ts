import { getCoregitClient } from "@/lib/coregit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const ref = req.nextUrl.searchParams.get("ref") || "main";
  const path = req.nextUrl.searchParams.get("path");

  if (!slug || !path) {
    return NextResponse.json(
      { error: "slug and path are required" },
      { status: 400 }
    );
  }

  const coregit = getCoregitClient();
  const result = await coregit.files.blob(slug, ref, path);

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data);
}
