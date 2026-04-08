"use client";

import { useState } from "react";
import {
  Undo2,
  Redo2,
  Share2,
  ExternalLink,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviewIframe } from "./preview-iframe";
import { CommitHistory } from "./commit-history";
import { DiffViewer } from "./diff-viewer";
import { CloneSnippet } from "./clone-snippet";

interface PreviewPanelProps {
  previewUrl: string | null;
  previewStatus: string;
  repoSlug: string | null;
  gitUrl: string | null;
  refreshKey?: number;
  activeBranch?: string;
  onRestore?: (sha: string) => Promise<void>;
  onCreateBranch?: (fromSha: string) => void;
}

export function PreviewPanel({
  previewUrl,
  previewStatus,
  repoSlug,
  gitUrl,
  refreshKey,
  activeBranch = "main",
  onRestore,
  onCreateBranch,
}: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState("preview");
  const [diffRange, setDiffRange] = useState<{
    base: string;
    head: string;
  } | null>(null);

  const handleViewDiff = (baseSha: string, headSha: string) => {
    setDiffRange({ base: baseSha, head: headSha });
    setActiveTab("diff");
  };

  const handleCloseDiff = () => {
    setDiffRange(null);
    setActiveTab("history");
  };

  return (
    <div className="flex flex-col h-full border-l border-border/60">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        {/* Preview toolbar — Webild-style */}
        <div className="shrink-0 flex items-center h-14 px-4 border-b border-border/40 gap-3">
          {/* Left: Tab pills */}
          <TabsList className="bg-muted/60 rounded-full p-0.5 h-auto">
            <TabsTrigger
              value="preview"
              className="text-xs px-3 py-1 rounded-full data-active:bg-background data-active:text-foreground data-active:shadow-sm"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs px-3 py-1 rounded-full data-active:bg-background data-active:text-foreground data-active:shadow-sm"
            >
              History
            </TabsTrigger>
            {diffRange && (
              <TabsTrigger
                value="diff"
                className="text-xs px-3 py-1 rounded-full data-active:bg-background data-active:text-foreground data-active:shadow-sm"
              >
                Diff
              </TabsTrigger>
            )}
          </TabsList>

          {/* Center: page label + undo/redo */}
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <button
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              title="Undo (restore previous)"
            >
              <Undo2 className="size-3.5" />
            </button>
            <button
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              title="Redo"
            >
              <Redo2 className="size-3.5" />
            </button>
          </div>
          <div className="flex-1" />

          {/* Right: Share + Open */}
          <div className="flex items-center gap-1.5">
            {gitUrl && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(gitUrl);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                title="Copy git URL"
              >
                <Share2 className="size-3.5" />
                Share
              </button>
            )}
            {previewUrl && (
              <button
                onClick={() => window.open(previewUrl, "_blank")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="size-3.5" />
                Open
              </button>
            )}
          </div>
        </div>

        <TabsContent value="preview" className="flex-1 min-h-0 m-0">
          <PreviewIframe url={previewUrl} status={previewStatus} />
        </TabsContent>

        <TabsContent
          value="history"
          className="flex-1 min-h-0 m-0 flex flex-col"
        >
          <div className="flex-1 min-h-0 overflow-auto">
            <CommitHistory
              repoSlug={repoSlug}
              activeBranch={activeBranch}
              refreshKey={refreshKey}
              onRestore={onRestore}
              onViewDiff={handleViewDiff}
              onCreateBranch={onCreateBranch}
            />
          </div>
          <CloneSnippet gitUrl={gitUrl} />
        </TabsContent>

        {diffRange && (
          <TabsContent value="diff" className="flex-1 min-h-0 m-0">
            <DiffViewer
              repoSlug={repoSlug}
              baseSha={diffRange.base}
              headSha={diffRange.head}
              onClose={handleCloseDiff}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
