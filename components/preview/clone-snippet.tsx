"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, GitBranch } from "lucide-react";

interface CloneSnippetProps {
  repoSlug: string | null;
  orgSlug?: string;
}

export function CloneSnippet({ repoSlug, orgSlug = "demo" }: CloneSnippetProps) {
  const [copied, setCopied] = useState(false);

  if (!repoSlug) return null;

  const cloneUrl = `https://api.coregit.dev/${orgSlug}/${repoSlug}.git`;
  const command = `git clone ${cloneUrl}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-border/40">
      <GitBranch className="size-3.5 text-muted-foreground shrink-0" />
      <code className="text-xs text-muted-foreground truncate flex-1 font-mono">
        git clone {cloneUrl}
      </code>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleCopy}
        className="shrink-0"
      >
        {copied ? (
          <Check className="size-3 text-success" />
        ) : (
          <Copy className="size-3" />
        )}
      </Button>
    </div>
  );
}
