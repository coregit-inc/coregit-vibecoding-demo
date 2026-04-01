"use client";

import { GitBranch } from "lucide-react";
import { CopyButton } from "@/components/copy-button";

interface CloneSnippetProps {
  gitUrl: string | null;
}

export function CloneSnippet({ gitUrl }: CloneSnippetProps) {
  if (!gitUrl) return null;

  const command = `git clone ${gitUrl}`;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-border/40">
      <GitBranch className="size-3.5 text-muted-foreground shrink-0" />
      <code className="text-xs text-muted-foreground truncate flex-1 font-mono">
        git clone {gitUrl}
      </code>
      <CopyButton text={command} />
    </div>
  );
}
