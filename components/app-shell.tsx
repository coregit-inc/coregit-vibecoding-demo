"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChatView } from "@/components/chat/chat-view";
import { PreviewPanel } from "@/components/preview/preview-panel";
import { TerminalOutput } from "@/components/terminal/terminal-output";
import { ResizeHandle } from "@/components/ui/resize-handle";
import { useRepo } from "@/hooks/use-repo";
import { useFileTree } from "@/hooks/use-file-tree";
import { useWebContainer } from "@/hooks/use-webcontainer";
import { useBranches } from "@/hooks/use-branches";

const MIN_CHAT_WIDTH = 360;
const MAX_CHAT_WIDTH_RATIO = 0.7;

export function AppShell() {
  const { repoSlug, gitUrl, ensureRepo, forkFromTemplate } = useRepo();
  const {
    branches,
    activeBranch,
    fetchBranches,
    createBranch,
    switchBranch,
  } = useBranches(repoSlug);
  const { items: fileTree, isLoading: isFileTreeLoading, refresh: refreshFileTree } = useFileTree(repoSlug, activeBranch);
  const { status: wcStatus, previewUrl, logs, syncAndRun } = useWebContainer();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [chatWidth, setChatWidth] = useState<number | null>(null);
  const [mergingBranch, setMergingBranch] = useState<string | null>(null);

  // Auto-sync WebContainer when repo is restored from session (boots automatically)
  const hasSynced = useRef(false);
  useEffect(() => {
    if (repoSlug && !hasSynced.current && fileTree.length > 0) {
      hasSynced.current = true;
      syncAndRun(repoSlug, undefined, activeBranch);
    }
  }, [repoSlug, fileTree, syncAndRun]);

  // Re-sync when branch changes
  const prevBranch = useRef(activeBranch);
  useEffect(() => {
    if (repoSlug && prevBranch.current !== activeBranch && hasSynced.current) {
      prevBranch.current = activeBranch;
      syncAndRun(repoSlug, undefined, activeBranch);
    }
  }, [repoSlug, activeBranch, syncAndRun]);

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
      fetchBranches();
      setRefreshKey((k) => k + 1);
      syncAndRun(repoSlug, files, activeBranch);
    },
    [repoSlug, refreshFileTree, fetchBranches, syncAndRun]
  );

  const handleRestore = useCallback(
    async (sha: string) => {
      if (!repoSlug) return;
      const res = await fetch("/api/refs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: repoSlug, sha }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Restore failed");
      }
      // Full re-sync: refresh file tree and re-mount all files in WebContainer
      refreshFileTree();
      setRefreshKey((k) => k + 1);
      syncAndRun(repoSlug, undefined, activeBranch);
    },
    [repoSlug, refreshFileTree, syncAndRun]
  );

  const handleCreateBranch = useCallback(
    async (fromSha: string) => {
      const name = prompt("Branch name:");
      if (!name) return;
      const ok = await createBranch(name, fromSha);
      if (ok) {
        switchBranch(name);
      }
    },
    [createBranch, switchBranch]
  );

  // Preview a suggestion branch — switch to it and sync
  const handlePreviewSuggestion = useCallback(
    (branch: string) => {
      fetchBranches();
      switchBranch(branch);
    },
    [fetchBranches, switchBranch]
  );

  // Accept a suggestion — merge it to main, switch back, cleanup
  const handleAcceptSuggestion = useCallback(
    async (suggestionBranch: string) => {
      if (!repoSlug) return;
      setMergingBranch(suggestionBranch);
      try {
        const res = await fetch("/api/branches/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: repoSlug,
            target: "main",
            source: suggestionBranch,
            strategy: "merge-commit",
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          alert(`Merge failed: ${data.error || "Unknown error"}`);
          return;
        }
        // Switch back to main and refresh
        switchBranch("main");
        fetchBranches();
        refreshFileTree();
        setRefreshKey((k) => k + 1);
      } finally {
        setMergingBranch(null);
      }
    },
    [repoSlug, switchBranch, fetchBranches, refreshFileTree]
  );

  // Dismiss suggestion preview — return to main
  const handleBackToMain = useCallback(() => {
    fetchBranches();
    switchBranch("main");
  }, [fetchBranches, switchBranch]);

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
          onForkTemplate={forkFromTemplate}
          activeBranch={activeBranch}
          branches={branches}
          onSwitchBranch={switchBranch}
          onFilesChanged={handleFilesChanged}
          onPreviewSuggestion={handlePreviewSuggestion}
          onAcceptSuggestion={handleAcceptSuggestion}
          onBackToMain={handleBackToMain}
          mergingBranch={mergingBranch}
          fileTree={fileTree}
          isFileTreeLoading={isFileTreeLoading}
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
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
            refreshKey={refreshKey}
            activeBranch={activeBranch}
            onRestore={handleRestore}
            onCreateBranch={handleCreateBranch}
          />
        </div>
        {logs.length > 0 && <TerminalOutput logs={logs} />}
      </div>
    </div>
  );
}
