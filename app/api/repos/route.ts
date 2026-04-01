import { getCoregitClient } from "@/lib/coregit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { slug } = await req.json();

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const coregit = getCoregitClient();
  const result = await coregit.repos.create({
    slug,
    description: "Created by Coregit Demo",
    init: true,
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data);
}
