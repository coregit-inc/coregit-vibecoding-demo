"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChatView } from "@/components/chat/chat-view";
import { PreviewPanel } from "@/components/preview/preview-panel";
import { TerminalOutput } from "@/components/terminal/terminal-output";
import { ResizeHandle } from "@/components/ui/resize-handle";
import { useRepo } from "@/hooks/use-repo";
import { useFileTree } from "@/hooks/use-file-tree";
import { useWebContainer } from "@/hooks/use-webcontainer";

const MIN_CHAT_WIDTH = 360;
const MAX_CHAT_WIDTH_RATIO = 0.7;

export function AppShell() {
  const { repoSlug, gitUrl, ensureRepo } = useRepo();
  const { items: fileTree, isLoading: isFileTreeLoading, refresh: refreshFileTree } = useFileTree(repoSlug);
  const { status: wcStatus, previewUrl, logs, boot, syncAndRun } = useWebContainer();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [chatWidth, setChatWidth] = useState<number | null>(null);

  // Boot WebContainer on mount
  useEffect(() => {
    boot();
  }, [boot]);

  // Auto-sync WebContainer when repo is restored from session
  const hasSynced = useRef(false);
  useEffect(() => {
    if (repoSlug && !hasSynced.current && fileTree.length > 0) {
      hasSynced.current = true;
      syncAndRun(repoSlug);
    }
  }, [repoSlug, fileTree, syncAndRun]);

  // Initialize chat width to 50% on mount
  useEffect(() => {
    setChatWidth(Math.round(window.innerWidth / 2));
  }, []);

  const handleResize = useCallback((delta: number) => {
    setChatWidth((prev) => {
      const current = prev ?? Math.round(window.innerWidth / 2);
      const maxWidth = Math.round(window.innerWidth * MAX_CHAT_WIDTH_RATIO);
      return Math.min(maxWidth, Math.max(MIN_CHAT_WIDTH, current + delta));
    });
  }, []);

  const handleFilesChanged = useCallback(
    async (files: string[]) => {
      if (!repoSlug) return;
      refreshFileTree();
      setRefreshKey((k) => k + 1);
      syncAndRun(repoSlug, files);
    },
    [repoSlug, refreshFileTree, syncAndRun]
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Chat Panel — left side */}
      <div
        className="flex flex-col shrink-0 relative"
        style={{ width: chatWidth ?? "50%" }}
      >
        <ChatView
          repoSlug={repoSlug}
          ensureRepo={ensureRepo}
          onFilesChanged={handleFilesChanged}
        />
        <ResizeHandle side="right" onResize={handleResize} />
      </div>

      {/* Preview Panel — right side */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex-1 min-h-0">
          <PreviewPanel
            previewUrl={previewUrl}
            previewStatus={wcStatus}
            repoSlug={repoSlug}
            gitUrl={gitUrl}
            fileTree={fileTree}
            isFileTreeLoading={isFileTreeLoading}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            refreshKey={refreshKey}
          />
        </div>
        {logs.length > 0 && <TerminalOutput logs={logs} />}
      </div>
    </div>
  );
}
