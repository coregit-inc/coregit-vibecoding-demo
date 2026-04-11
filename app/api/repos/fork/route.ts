import { getCoregitClient } from "@/lib/coregit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { source, slug, description } = await req.json();

  if (!source || !slug) {
    return NextResponse.json(
      { error: "source and slug are required" },
      { status: 400 }
    );
  }

  const coregit = getCoregitClient();
  const result = await coregit.repos.fork(source, {
    slug,
    description,
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data);
}
