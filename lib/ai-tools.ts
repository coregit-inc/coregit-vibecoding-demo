import { tool } from "ai";
import { z } from "zod";
import type { CoregitClient } from "@coregit/sdk";

export function createTools(coregit: CoregitClient, repoSlug: string, branch: string = "main") {
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
          branch: branch,
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
          branch: branch,
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
        const result = await coregit.files.blob(repoSlug, branch, path);
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
          branch,
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

    createSuggestion: tool({
      description:
        "Create a suggestion as a separate git branch. Use this when the user asks for alternatives, options, or variations. Each suggestion gets its own branch so the user can preview the actual result before accepting. Call this tool once per suggestion — if the user wants 3 options, call it 3 times with different names.",
      inputSchema: z.object({
        name: z
          .string()
          .describe(
            "Short kebab-case name for this suggestion (e.g., 'bold-hero', 'minimal-layout'). Will be prefixed with 'suggestion/'."
          ),
        title: z
          .string()
          .describe("Human-readable title (e.g., 'Bold & Modern')"),
        description: z
          .string()
          .describe(
            "One-line description of what this suggestion changes"
          ),
        files: z
          .array(
            z.object({
              path: z.string().describe("File path relative to repo root"),
              content: z.string().describe("Full file content"),
            })
          )
          .describe("All files for this suggestion (complete, runnable)"),
      }),
      execute: async ({ name, title, description, files }) => {
        const branchName = `suggestion/${name}`;

        // Create branch from current branch HEAD
        const branchResult = await coregit.branches.create(repoSlug, {
          name: branchName,
          from: branch,
        });
        if (branchResult.error) {
          return {
            success: false as const,
            error: branchResult.error.message,
          };
        }

        // Commit files to the suggestion branch
        const commitResult = await coregit.commits.create(repoSlug, {
          branch: branchName,
          message: `suggestion: ${title}`,
          author: { name: "AI Assistant", email: "ai@coregit.dev" },
          changes: files.map((f) => ({
            path: f.path,
            content: f.content,
            encoding: "utf-8" as const,
          })),
        });
        if (commitResult.error) {
          return {
            success: false as const,
            error: commitResult.error.message,
          };
        }

        return {
          success: true as const,
          suggestion: true as const,
          branch: branchName,
          title,
          description,
          sha: commitResult.data!.sha,
          filesWritten: files.map((f) => f.path),
        };
      },
    }),

    searchCode: tool({
      description:
        "Full-text search across repository files. Use this to find exact code patterns, function names, imports, strings, or any literal text in the codebase.",
      inputSchema: z.object({
        query: z.string().describe("Search query (text or regex pattern)"),
        regex: z
          .boolean()
          .optional()
          .describe("Treat query as regex (default: false)"),
        path_pattern: z
          .string()
          .optional()
          .describe("Glob pattern to filter files (e.g., '*.ts', 'src/**/*.tsx')"),
        max_results: z
          .number()
          .optional()
          .describe("Maximum results to return (default: 20)"),
      }),
      execute: async ({ query, regex, path_pattern, max_results }) => {
        const result = await coregit.search.query({
          q: query,
          repos: [repoSlug],
          regex,
          path_pattern,
          max_results: max_results ?? 20,
          ref: branch,
        });
        if (result.error) {
          return { success: false as const, error: result.error.message };
        }
        return {
          success: true as const,
          total: result.data!.total,
          truncated: result.data!.truncated,
          matches: result.data!.matches.map((m) => ({
            file: m.path,
            line: m.line,
            content: m.content,
            context_before: m.context_before,
            context_after: m.context_after,
          })),
        };
      },
    }),

    semanticSearch: tool({
      description:
        "AI-powered semantic search — finds code by meaning, not just text. Use this when the user asks conceptual questions like 'where is authentication handled?' or 'find the payment logic'.",
      inputSchema: z.object({
        query: z
          .string()
          .describe("Natural language query describing what you're looking for"),
        path_pattern: z
          .string()
          .optional()
          .describe("Glob pattern to filter files"),
        language: z
          .string()
          .optional()
          .describe("Filter by programming language (e.g., 'typescript', 'css')"),
        top_k: z
          .number()
          .optional()
          .describe("Number of results (default: 10)"),
      }),
      execute: async ({ query, path_pattern, language, top_k }) => {
        const result = await coregit.search.semantic(repoSlug, {
          q: query,
          ref: branch,
          path_pattern,
          language,
          top_k: top_k ?? 10,
        });
        if (result.error) {
          return { success: false as const, error: result.error.message };
        }
        return {
          success: true as const,
          results: result.data!.results.map((r) => ({
            file_path: r.file_path,
            snippet: r.snippet,
            score: r.score,
            language: r.language,
            start_line: r.start_line,
            end_line: r.end_line,
          })),
        };
      },
    }),

    analyzeCode: tool({
      description:
        "Query the code graph to understand code structure, dependencies, call chains, and relationships. Use this before refactoring, to find unused exports, trace data flow, or understand impact of changes.",
      inputSchema: z.object({
        type: z
          .enum([
            "callers",
            "callees",
            "dependencies",
            "dependents",
            "type_hierarchy",
            "impact_analysis",
            "file_structure",
            "symbol_lookup",
            "unused_exports",
            "circular_deps",
            "api_routes",
            "data_flow",
          ])
          .describe("Type of code graph query"),
        name: z
          .string()
          .optional()
          .describe("Symbol name to analyze (for callers, callees, symbol_lookup, etc.)"),
        file_path: z
          .string()
          .optional()
          .describe("File path to scope the analysis"),
        max_depth: z
          .number()
          .optional()
          .describe("Max traversal depth (default: 3)"),
      }),
      execute: async ({ type, name, file_path, max_depth }) => {
        const result = await coregit.graph.query(repoSlug, {
          type,
          name,
          file_path,
          ref: branch,
          max_depth,
        });
        if (result.error) {
          return { success: false as const, error: result.error.message };
        }
        return {
          success: true as const,
          query_type: result.data!.query_type,
          nodes: result.data!.nodes.map((n) => ({
            id: n.id,
            type: n.type,
            name: n.name,
            file_path: n.file_path,
            start_line: n.start_line,
            end_line: n.end_line,
            signature: n.signature,
            language: n.language,
            exported: n.exported,
          })),
          edges: result.data!.edges?.map((e) => ({
            source: e.source_id,
            target: e.target_id,
            type: e.type,
          })),
        };
      },
    }),

    hybridSearch: tool({
      description:
        "Smart combined search using text, semantic, and graph signals. Use this when you need deep context — it finds relevant code AND its relationships. Best for complex queries like 'how does the auth flow work?' or 'what would be affected if I change the User model?'.",
      inputSchema: z.object({
        query: z.string().describe("Natural language search query"),
        strategy: z
          .enum(["auto", "semantic", "graph", "hybrid"])
          .optional()
          .describe("Search strategy (default: auto)"),
        include_graph: z
          .boolean()
          .optional()
          .describe("Include relationship data in results (default: true)"),
      }),
      execute: async ({ query, strategy, include_graph }) => {
        const result = await coregit.graph.hybridSearch(repoSlug, {
          q: query,
          ref: branch,
          strategy,
          top_k: 10,
          include_graph: include_graph ?? true,
        });
        if (result.error) {
          return { success: false as const, error: result.error.message };
        }
        return {
          success: true as const,
          strategy_used: result.data!.strategy_used,
          results: result.data!.results.map((r) => ({
            file_path: r.file_path,
            name: r.name,
            type: r.type,
            score: r.score,
            snippet: r.snippet,
            start_line: r.start_line,
            end_line: r.end_line,
            language: r.language,
            relationships: r.relationships,
          })),
        };
      },
    }),

    forkRepo: tool({
      description:
        "Fork a template repository to create a new project with pre-built code. Use this when the user wants to start from a template or existing project.",
      inputSchema: z.object({
        source: z
          .string()
          .describe("Source repo slug to fork from (e.g., 'templates/react-vite')"),
        description: z
          .string()
          .optional()
          .describe("Description for the new forked repo"),
      }),
      execute: async ({ source, description }) => {
        const newSlug = `demo-${Date.now().toString(36)}`;
        const result = await coregit.repos.fork(source, {
          slug: newSlug,
          description,
        });
        if (result.error) {
          return { success: false as const, error: result.error.message };
        }
        return {
          success: true as const,
          slug: result.data!.slug,
          git_url: result.data!.git_url,
          forked_from: result.data!.forked_from.slug,
        };
      },
    }),
  };
}
