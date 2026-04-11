import { getCoregitClient } from "@/lib/coregit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { slug, query, path_pattern, language, top_k, ref } =
    await req.json();

  if (!slug || !query) {
    return NextResponse.json(
      { error: "slug and query are required" },
      { status: 400 }
    );
  }

  const coregit = getCoregitClient();
  const result = await coregit.search.semantic(slug, {
    q: query,
    ref: ref ?? "main",
    path_pattern,
    language,
    top_k: top_k ?? 10,
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data);
}
