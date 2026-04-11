import { getCoregitClient } from "@/lib/coregit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { slug, type, name, file_path, max_depth, ref } = await req.json();

  if (!slug || !type) {
    return NextResponse.json(
      { error: "slug and type are required" },
      { status: 400 }
    );
  }

  const coregit = getCoregitClient();
  const result = await coregit.graph.query(slug, {
    type,
    name,
    file_path,
    ref: ref ?? "main",
    max_depth,
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data);
}
