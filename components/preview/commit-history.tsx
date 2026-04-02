"use client";

import { useState, useEffect, useCallback } from "react";
import { GitCommit, Loader2, RotateCcw } from "lucide-react";

interface Commit {
  sha: string;
  message: string;
  author_name: string;
  timestamp: number;
}

interface CommitHistoryProps {
  repoSlug: string | null;
  refreshKey?: number;
  onRestore?: (sha: string) => Promise<void>;
}

export function CommitHistory({ repoSlug, refreshKey, onRestore }: CommitHistoryProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringTo, setRestoringTo] = useState<string | null>(null);

  const fetchCommits = useCallback(async () => {
    if (!repoSlug) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/commits?slug=${repoSlug}`);
      if (res.ok) {
        const data = await res.json();
        setCommits(data.commits || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [repoSlug]);

  useEffect(() => {
    fetchCommits();
  }, [fetchCommits, refreshKey]);

  const handleRestore = async (sha: string) => {
    if (!onRestore || restoringTo) return;
    setRestoringTo(sha);
    try {
      await onRestore(sha);
      await fetchCommits();
    } finally {
      setRestoringTo(null);
    }
  };

  if (isLoading && commits.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="size-4 animate-spin mr-2" />
        Loading history...
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <GitCommit className="size-8 opacity-40" />
        <p className="text-sm">No commits yet</p>
        <p className="text-xs">Send a message to generate code</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {commits.map((commit, index) => (
        <div
          key={commit.sha}
          className="group flex items-start gap-3 px-3 py-2.5 border-b border-border/40 last:border-b-0"
        >
          <GitCommit className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{commit.message}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="font-mono">{commit.sha.slice(0, 7)}</span>
              {" · "}
              {new Date(commit.timestamp * 1000).toLocaleTimeString()}
            </p>
          </div>
          {/* Show restore button for all commits except the latest (index 0) */}
          {index > 0 && onRestore && (
            <button
              onClick={() => handleRestore(commit.sha)}
              disabled={!!restoringTo}
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50"
              title={`Restore to ${commit.sha.slice(0, 7)}`}
            >
              {restoringTo === commit.sha ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <RotateCcw className="size-3" />
              )}
              Restore
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
