"use client";

import { Code2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PreviewIframe } from "./preview-iframe";
import { FileExplorer } from "./file-explorer";
import { FileViewer } from "./file-viewer";
import { CommitHistory } from "./commit-history";
import { CloneSnippet } from "./clone-snippet";
import type { TreeEntry } from "@/hooks/use-file-tree";

interface PreviewPanelProps {
  previewUrl: string | null;
  previewStatus: string;
  repoSlug: string | null;
  gitUrl: string | null;
  fileTree: TreeEntry[];
  isFileTreeLoading: boolean;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  refreshKey?: number;
}

export function PreviewPanel({
  previewUrl,
  previewStatus,
  repoSlug,
  gitUrl,
  fileTree,
  isFileTreeLoading,
  selectedFile,
  onFileSelect,
  refreshKey,
}: PreviewPanelProps) {
  return (
    <div className="flex flex-col h-full border-l border-border/60">
      <Tabs defaultValue="preview" className="flex flex-col h-full">
        <TabsList className="shrink-0 w-full justify-start rounded-none border-b border-border/60 bg-transparent px-2 h-10">
          <TabsTrigger value="preview" className="text-xs">
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="text-xs">
            Code
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="flex-1 min-h-0 m-0">
          <PreviewIframe url={previewUrl} status={previewStatus} />
        </TabsContent>

        <TabsContent value="code" className="flex-1 min-h-0 m-0">
          {!isFileTreeLoading && fileTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Code2 className="size-8 opacity-40" />
              <p className="text-sm">No files yet</p>
              <p className="text-xs">Send a message to generate code</p>
            </div>
          ) : (
            <div className="flex h-full">
              <ScrollArea className="w-48 border-r border-border/60 shrink-0">
                <FileExplorer
                  items={fileTree}
                  isLoading={isFileTreeLoading}
                  onFileSelect={onFileSelect}
                  selectedFile={selectedFile}
                />
              </ScrollArea>
              <div className="flex-1 min-w-0">
                <FileViewer repoSlug={repoSlug} filePath={selectedFile} />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="flex-1 min-h-0 m-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <CommitHistory repoSlug={repoSlug} refreshKey={refreshKey} />
          </div>
          <CloneSnippet gitUrl={gitUrl} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
