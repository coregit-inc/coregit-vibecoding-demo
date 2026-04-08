"use client";

import { useState, useCallback, useEffect } from "react";

interface Branch {
  name: string;
  sha: string;
}

interface BranchListData {
  branches: Branch[];
  default_branch: string;
}

export function useBranches(repoSlug: string | null) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [activeBranch, setActiveBranch] = useState("main");
  const [isLoading, setIsLoading] = useState(false);

  const fetchBranches = useCallback(async () => {
    if (!repoSlug) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/branches?slug=${repoSlug}`);
      if (res.ok) {
        const data: BranchListData = await res.json();
        setBranches(data.branches || []);
        setDefaultBranch(data.default_branch || "main");
      }
    } finally {
      setIsLoading(false);
    }
  }, [repoSlug]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const createBranch = useCallback(
    async (name: string, fromSha?: string): Promise<boolean> => {
      if (!repoSlug) return false;
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: repoSlug, name, from_sha: fromSha }),
      });
      if (!res.ok) return false;
      await fetchBranches();
      return true;
    },
    [repoSlug, fetchBranches]
  );

  const mergeBranch = useCallback(
    async (
      source: string,
      target: string,
      strategy?: string
    ): Promise<boolean> => {
      if (!repoSlug) return false;
      const res = await fetch("/api/branches/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: repoSlug, target, source, strategy }),
      });
      if (!res.ok) return false;
      await fetchBranches();
      return true;
    },
    [repoSlug, fetchBranches]
  );

  const switchBranch = useCallback(
    (name: string) => {
      setActiveBranch(name);
    },
    []
  );

  return {
    branches,
    defaultBranch,
    activeBranch,
    isLoading,
    fetchBranches,
    createBranch,
    mergeBranch,
    switchBranch,
  };
}
