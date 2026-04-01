"use client";

import { useState, useCallback, useRef } from "react";
import { nanoid } from "nanoid";

export function useRepo() {
  const [repoSlug, setRepoSlug] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const creatingRef = useRef(false);

  const ensureRepo = useCallback(async (): Promise<string> => {
    // Return existing repo
    if (repoSlug) return repoSlug;

    // Check sessionStorage
    const stored = sessionStorage.getItem("coregit-demo-repo");
    if (stored) {
      setRepoSlug(stored);
      return stored;
    }

    // Prevent double creation
    if (creatingRef.current) {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const slug = sessionStorage.getItem("coregit-demo-repo");
          if (slug) {
            clearInterval(interval);
            resolve(slug);
          }
        }, 100);
      });
    }

    creatingRef.current = true;
    setIsCreating(true);

    const slug = `demo-${nanoid(8)}`;

    try {
      const res = await fetch("/api/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create repo: ${res.statusText}`);
      }

      sessionStorage.setItem("coregit-demo-repo", slug);
      setRepoSlug(slug);
      return slug;
    } finally {
      setIsCreating(false);
      creatingRef.current = false;
    }
  }, [repoSlug]);

  return { repoSlug, isCreating, ensureRepo };
}
