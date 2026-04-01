"use client";

import { GitBranch } from "lucide-react";
import { CopyButton } from "@/components/copy-button";

interface CloneSnippetProps {
  gitUrl: string | null;
}

export function CloneSnippet({ gitUrl }: CloneSnippetProps) {
  if (!gitUrl) return null;

  // Insert auth placeholder into URL: https://api.coregit.dev/org/repo.git → https://org:API_KEY@api.coregit.dev/org/repo.git
  const authUrl = gitUrl.replace("https://api.coregit.dev/", "https://<org>:<api-key>@api.coregit.dev/");
  const command = `git clone ${authUrl}`;

  return (
    <div className="flex flex-col gap-1 px-3 py-2 border-t border-border/40">
      <div className="flex items-center gap-2">
        <GitBranch className="size-3.5 text-muted-foreground shrink-0" />
        <code className="text-xs text-muted-foreground truncate flex-1 font-mono">
          git clone {authUrl}
        </code>
        <CopyButton text={command} />
      </div>
      <p className="text-[10px] text-muted-foreground/60 ml-5.5">
        Private repo — replace &lt;org&gt; and &lt;api-key&gt; with your Coregit credentials
      </p>
    </div>
  );
}
