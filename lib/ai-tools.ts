import { tool } from "ai";
import { z } from "zod";
import type { CoregitClient } from "@coregit/sdk";

export function createTools(coregit: CoregitClient, repoSlug: string) {
  return {
    commitFiles: tool({
      description:
        "Write one or more files and commit them to the repository. Use this whenever you need to create or modify files. All changes are committed atomically in a single operation.",
      inputSchema: z.object({
        message: z
          .string()
          .describe("Git commit message describing the changes"),
        files: z
          .array(
            z.object({
              path: z
                .string()
                .describe(
                  "File path relative to repo root (e.g., 'src/App.tsx')"
                ),
              content: z.string().describe("Full file content"),
            })
          )
          .describe("Array of files to create or update"),
      }),
      execute: async ({ message, files }) => {
        const result = await coregit.commits.create(repoSlug, {
          branch: "main",
          message,
          author: { name: "AI Assistant", email: "ai@coregit.dev" },
          changes: files.map((f) => ({
            path: f.path,
            content: f.content,
            encoding: "utf-8" as const,
          })),
        });
        if (result.error) {
          return { success: false as const, error: result.error.message };
        }
        return {
          success: true as const,
          sha: result.data!.sha,
          filesWritten: files.map((f) => f.path),
        };
      },
    }),

    deleteFiles: tool({
      description: "Delete one or more files from the repository.",
      inputSchema: z.object({
        message: z.string().describe("Git commit message"),
        paths: z.array(z.string()).describe("File paths to delete"),
      }),
      execute: async ({ message, paths }) => {
        const result = await coregit.commits.create(repoSlug, {
          branch: "main",
          message,
          author: { name: "AI Assistant", email: "ai@coregit.dev" },
          changes: paths.map((p) => ({ path: p, action: "delete" as const })),
        });
        if (result.error) {
          return { success: false as const, error: result.error.message };
        }
        return {
          success: true as const,
          sha: result.data!.sha,
          filesDeleted: paths,
        };
      },
    }),

    readFile: tool({
      description:
        "Read the contents of a file from the repository. Use this to understand existing code before making modifications.",
      inputSchema: z.object({
        path: z.string().describe("File path to read"),
      }),
      execute: async ({ path }) => {
        const result = await coregit.files.blob(repoSlug, "main", path);
        if (result.error) {
          return { exists: false as const, error: result.error.message };
        }
        return {
          exists: true as const,
          content: result.data!.content,
          size: result.data!.content.length,
        };
      },
    }),

    listFiles: tool({
      description:
        "List files and directories at a given path in the repository.",
      inputSchema: z.object({
        path: z
          .string()
          .optional()
          .describe("Directory path (empty for root)"),
      }),
      execute: async ({ path }) => {
        const result = await coregit.files.tree(
          repoSlug,
          "main",
          path || undefined
        );
        if (result.error) {
          return { success: false as const, error: result.error.message };
        }
        return {
          success: true as const,
          items: result.data!.items.map((i) => ({
            name: i.name,
            type: i.type,
            path: i.path,
          })),
        };
      },
    }),
  };
}
