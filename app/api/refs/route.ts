import { getCoregitClient } from "@/lib/coregit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { slug, sha } = await req.json();

  if (!slug || !sha) {
    return NextResponse.json(
      { error: "slug and sha are required" },
      { status: 400 }
    );
  }

  const coregit = getCoregitClient();
  const result = await coregit.refs.update(slug, "refs/heads/main", { sha });

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data);
}
