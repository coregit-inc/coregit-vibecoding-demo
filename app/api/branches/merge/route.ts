import { getCoregitClient } from "@/lib/coregit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { slug, target, source, strategy } = await req.json();

  if (!slug || !target || !source) {
    return NextResponse.json(
      { error: "slug, target, and source are required" },
      { status: 400 }
    );
  }

  const coregit = getCoregitClient();
  const result = await coregit.branches.merge(slug, target, {
    source,
    strategy: strategy || "merge-commit",
    author: { name: "AI Assistant", email: "ai@coregit.dev" },
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data);
}
