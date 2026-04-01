"use client";

import { useState, useEffect, useCallback } from "react";
import { GitCommit, Loader2 } from "lucide-react";

interface Commit {
  sha: string;
  message: string;
  author_name: string;
  timestamp: number;
}

interface CommitHistoryProps {
  repoSlug: string | null;
  refreshKey?: number;
}

export function CommitHistory({ repoSlug, refreshKey }: CommitHistoryProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      {commits.map((commit) => (
        <div
          key={commit.sha}
          className="flex items-start gap-3 px-3 py-2.5 border-b border-border/40 last:border-b-0"
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
        </div>
      ))}
    </div>
  );
}
