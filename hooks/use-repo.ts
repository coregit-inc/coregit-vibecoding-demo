"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

export function useRepo() {
  const [repoSlug, setRepoSlug] = useState<string | null>(null);
  const [gitUrl, setGitUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const creatingRef = useRef(false);

  // Restore from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("coregit-demo-repo");
    if (stored) setRepoSlug(stored);
    const storedGitUrl = sessionStorage.getItem("coregit-demo-git-url");
    if (storedGitUrl) setGitUrl(storedGitUrl);
  }, []);

  const ensureRepo = useCallback(async (): Promise<string> => {
    if (repoSlug) return repoSlug;

    const stored = sessionStorage.getItem("coregit-demo-repo");
    if (stored) {
      setRepoSlug(stored);
      const storedGitUrl = sessionStorage.getItem("coregit-demo-git-url");
      if (storedGitUrl) setGitUrl(storedGitUrl);
      return stored;
    }

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

    const slug = `demo-${nanoid()}`;

    try {
      const res = await fetch("/api/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create repo: ${res.statusText}`);
      }

      const data = await res.json();
      const repoGitUrl = data.git_url || null;

      sessionStorage.setItem("coregit-demo-repo", slug);
      if (repoGitUrl) sessionStorage.setItem("coregit-demo-git-url", repoGitUrl);
      setRepoSlug(slug);
      setGitUrl(repoGitUrl);
      return slug;
    } finally {
      setIsCreating(false);
      creatingRef.current = false;
    }
  }, [repoSlug]);

  return { repoSlug, gitUrl, isCreating, ensureRepo };
}
