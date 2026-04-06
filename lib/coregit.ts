import { CoregitClient } from "@coregit/sdk";

let client: CoregitClient | null = null;

export function getCoregitClient(): CoregitClient {
  if (!client) {
    const apiKey = process.env.COREGIT_API_KEY;
    if (!apiKey) throw new Error("COREGIT_API_KEY environment variable is required");
    client = new CoregitClient({ apiKey });
  }
  return client;
}
