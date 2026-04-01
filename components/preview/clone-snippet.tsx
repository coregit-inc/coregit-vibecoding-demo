"use client";

import { GitBranch } from "lucide-react";
import { CopyButton } from "@/components/copy-button";

interface CloneSnippetProps {
  repoSlug: string | null;
  orgSlug?: string;
}

export function CloneSnippet({ repoSlug, orgSlug = "demo" }: CloneSnippetProps) {
  if (!repoSlug) return null;

  const cloneUrl = `https://api.coregit.dev/${orgSlug}/${repoSlug}.git`;
  const command = `git clone ${cloneUrl}`;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-border/40">
      <GitBranch className="size-3.5 text-muted-foreground shrink-0" />
      <code className="text-xs text-muted-foreground truncate flex-1 font-mono">
        git clone {cloneUrl}
      </code>
      <CopyButton text={command} />
    </div>
  );
}
