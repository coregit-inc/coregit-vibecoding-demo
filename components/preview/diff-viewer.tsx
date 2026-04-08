"use client";

import { useState, useEffect, useCallback } from "react";
import { FileCode, Plus, Minus, Loader2, ArrowLeft } from "lucide-react";

interface DiffFile {
  path: string;
  status: "added" | "removed" | "modified";
  old_sha: string | null;
  new_sha: string | null;
  patch?: string;
}

interface DiffData {
  base: string;
  head: string;
  files: DiffFile[];
  total_files_changed: number;
  total_additions: number;
  total_deletions: number;
}

interface DiffViewerProps {
  repoSlug: string | null;
  baseSha: string | null;
  headSha: string | null;
  onClose: () => void;
}

function parsePatch(patch: string) {
  const lines = patch.split("\n");
  const result: { type: "add" | "remove" | "context" | "header"; text: string }[] = [];

  for (const line of lines) {
    if (line.startsWith("@@")) {
      result.push({ type: "header", text: line });
    } else if (line.startsWith("+")) {
      result.push({ type: "add", text: line.slice(1) });
    } else if (line.startsWith("-")) {
      result.push({ type: "remove", text: line.slice(1) });
    } else if (line.startsWith(" ")) {
      result.push({ type: "context", text: line.slice(1) });
    }
  }

  return result;
}

function FileStatusBadge({ status }: { status: DiffFile["status"] }) {
  const config = {
    added: { label: "Added", className: "bg-emerald-500/10 text-emerald-500" },
    removed: { label: "Removed", className: "bg-red-500/10 text-red-500" },
    modified: { label: "Modified", className: "bg-amber-500/10 text-amber-500" },
  };
  const c = config[status];
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${c.className}`}>
      {c.label}
    </span>
  );
}

export function DiffViewer({ repoSlug, baseSha, headSha, onClose }: DiffViewerProps) {
  const [diff, setDiff] = useState<DiffData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const fetchDiff = useCallback(async () => {
    if (!repoSlug || !baseSha || !headSha) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/diff?slug=${repoSlug}&base=${baseSha}&head=${headSha}`
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to load diff");
        return;
      }
      const data: DiffData = await res.json();
      setDiff(data);
      // Auto-expand first file
      if (data.files.length > 0) {
        setExpandedFile(data.files[0].path);
      }
    } catch {
      setError("Failed to load diff");
    } finally {
      setIsLoading(false);
    }
  }, [repoSlug, baseSha, headSha]);

  useEffect(() => {
    fetchDiff();
  }, [fetchDiff]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <Loader2 className="size-4 animate-spin mr-2" />
        Loading diff...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
        <p className="text-sm">{error}</p>
        <button onClick={onClose} className="text-xs underline">
          Go back
        </button>
      </div>
    );
  }

  if (!diff) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3" />
          Back
        </button>
        <div className="h-3 w-px bg-border/40" />
        <span className="text-xs text-muted-foreground font-mono">
          {baseSha?.slice(0, 7)}..{headSha?.slice(0, 7)}
        </span>
        <div className="flex items-center gap-2 ml-auto text-xs">
          <span className="text-muted-foreground">
            {diff.total_files_changed} file{diff.total_files_changed !== 1 ? "s" : ""}
          </span>
          <span className="text-emerald-500 flex items-center gap-0.5">
            <Plus className="size-3" />
            {diff.total_additions}
          </span>
          <span className="text-red-500 flex items-center gap-0.5">
            <Minus className="size-3" />
            {diff.total_deletions}
          </span>
        </div>
      </div>

      {/* File list + patches */}
      <div className="flex-1 overflow-y-auto">
        {diff.files.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No changes
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {diff.files.map((file) => (
              <div key={file.path}>
                {/* File header */}
                <button
                  onClick={() =>
                    setExpandedFile(expandedFile === file.path ? null : file.path)
                  }
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                >
                  <FileCode className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-mono truncate flex-1">
                    {file.path}
                  </span>
                  <FileStatusBadge status={file.status} />
                </button>

                {/* Patch content */}
                {expandedFile === file.path && file.patch && (
                  <div className="border-t border-border/20 bg-muted/20 font-mono text-xs leading-5 overflow-x-auto">
                    {parsePatch(file.patch).map((line, i) => (
                      <div
                        key={i}
                        className={`px-3 ${
                          line.type === "add"
                            ? "bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400"
                            : line.type === "remove"
                            ? "bg-red-500/[0.08] text-red-600 dark:text-red-400"
                            : line.type === "header"
                            ? "bg-muted/50 text-muted-foreground"
                            : "text-foreground/70"
                        }`}
                      >
                        <span className="select-none text-muted-foreground/50 mr-2 inline-block w-3">
                          {line.type === "add"
                            ? "+"
                            : line.type === "remove"
                            ? "-"
                            : line.type === "header"
                            ? ""
                            : " "}
                        </span>
                        {line.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* No patch available */}
                {expandedFile === file.path && !file.patch && (
                  <div className="px-3 py-4 text-xs text-muted-foreground text-center border-t border-border/20">
                    {file.status === "added"
                      ? "New file"
                      : file.status === "removed"
                      ? "File deleted"
                      : "Binary or empty diff"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
