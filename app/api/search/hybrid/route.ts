import { getCoregitClient } from "@/lib/coregit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { slug, query, strategy, include_graph, ref } = await req.json();

  if (!slug || !query) {
    return NextResponse.json(
      { error: "slug and query are required" },
      { status: 400 }
    );
  }

  const coregit = getCoregitClient();
  const result = await coregit.graph.hybridSearch(slug, {
    q: query,
    ref: ref ?? "main",
    strategy,
    top_k: 10,
    include_graph: include_graph ?? true,
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data);
}
