import { getCoregitClient } from "@/lib/coregit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { slug, query, regex, path_pattern, max_results, ref } =
    await req.json();

  if (!slug || !query) {
    return NextResponse.json(
      { error: "slug and query are required" },
      { status: 400 }
    );
  }

  const coregit = getCoregitClient();
  const result = await coregit.search.query({
    q: query,
    repos: [slug],
    regex,
    path_pattern,
    max_results: max_results ?? 30,
    ref: ref ?? "main",
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data);
}
