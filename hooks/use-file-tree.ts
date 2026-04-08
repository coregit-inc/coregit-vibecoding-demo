"use client";

import { useState, useCallback, useEffect } from "react";

export interface TreeEntry {
  name: string;
  path: string;
  type: "folder" | "file";
  sha: string;
  mode: string;
}

export function useFileTree(repoSlug: string | null, activeBranch: string = "main") {
  const [items, setItems] = useState<TreeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(
    async (path?: string) => {
      if (!repoSlug) return;
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ slug: repoSlug, ref: activeBranch });
        if (path) params.set("path", path);
        const res = await fetch(`/api/files/tree?${params}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [repoSlug, activeBranch]
  );

  // Auto-load when repoSlug or branch changes
  useEffect(() => {
    if (repoSlug) refresh();
  }, [repoSlug, refresh]);

  return { items, isLoading, refresh };
}
