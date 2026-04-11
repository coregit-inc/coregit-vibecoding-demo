import { getCoregitClient } from "@/lib/coregit";
import { NextResponse } from "next/server";

export async function GET() {
  const coregit = getCoregitClient();
  const result = await coregit.repos.list({ is_template: true });

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data);
}
