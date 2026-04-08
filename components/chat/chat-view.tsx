"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { UIMessage } from "ai";
import { useTheme } from "next-themes";
import { Moon, Sun, GitBranch, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChatMessages } from "./chat-messages";
import { PromptInput } from "./prompt-input";
import { FileExplorer } from "@/components/preview/file-explorer";
import { FileViewer } from "@/components/preview/file-viewer";
import type { TreeEntry } from "@/hooks/use-file-tree";

interface Branch {
  name: string;
  sha: string;
}

interface ChatViewProps {
  repoSlug: string | null;
  ensureRepo: () => Promise<string>;
  activeBranch?: string;
  branches?: Branch[];
  onSwitchBranch?: (name: string) => void;
  onFilesChanged?: (files: string[]) => void;
  onPreviewSuggestion?: (branch: string) => void;
  onAcceptSuggestion?: (branch: string) => void;
  fileTree?: TreeEntry[];
  isFileTreeLoading?: boolean;
  selectedFile?: string | null;
  onFileSelect?: (path: string) => void;
}

function loadMessages(repoSlug: string | null): UIMessage[] {
  if (!repoSlug) return [];
  try {
    const stored = sessionStorage.getItem(`chat-${repoSlug}`);
    if (!stored) return [];
    return JSON.parse(stored) as UIMessage[];
  } catch {
    return [];
  }
}

function saveMessages(repoSlug: string | null, messages: UIMessage[]) {
  if (!repoSlug || messages.length === 0) return;
  try {
    sessionStorage.setItem(`chat-${repoSlug}`, JSON.stringify(messages));
  } catch {
    // sessionStorage full or unavailable
  }
}

export function ChatView({
  repoSlug,
  ensureRepo,
  activeBranch = "main",
  branches = [],
  onSwitchBranch,
  onFilesChanged,
  onPreviewSuggestion,
  onAcceptSuggestion,
  fileTree = [],
  isFileTreeLoading = false,
  selectedFile = null,
  onFileSelect,
}: ChatViewProps) {
  const initialMessages = useMemo(() => loadMessages(repoSlug), [repoSlug]);
  const [activePanel, setActivePanel] = useState<"chat" | "code">("chat");

  const {
    messages,
    sendMessage,
    status,
    stop,
  } = useChat({
    id: repoSlug ? `chat-${repoSlug}` : undefined,
    messages: initialMessages.length > 0 ? initialMessages : undefined,
    onFinish({ message }) {
      // Extract committed files from tool results
      const changedFiles: string[] = [];
      message.parts?.forEach((part) => {
        if (part.type.startsWith("tool-") && "output" in part && part.state === "output-available") {
          const result = part.output as Record<string, unknown>;
          if (result?.filesWritten) {
            changedFiles.push(...(result.filesWritten as string[]));
          }
          if (result?.filesDeleted) {
            changedFiles.push(...(result.filesDeleted as string[]));
          }
        }
      });
      if (changedFiles.length > 0) {
        onFilesChanged?.(changedFiles);
      }
    },
  });

  // Persist messages to sessionStorage
  useEffect(() => {
    saveMessages(repoSlug, messages);
  }, [repoSlug, messages]);

  const { theme, setTheme } = useTheme();
  const isStreaming = status === "streaming" || status === "submitted";

  const handleSend = useCallback(
    async (prompt: string) => {
      const slug = await ensureRepo();
      sendMessage(
        { text: prompt },
        { body: { repoSlug: slug, activeBranch } }
      );
    },
    [ensureRepo, sendMessage, activeBranch]
  );

  return (
    <div className="flex flex-col overflow-hidden min-w-0 h-full">
      {/* Header */}
      <header className="flex h-14 items-center px-4 shrink-0 border-b border-border/40">
        {/* Brand */}
        <div className="flex items-center gap-1.5 min-w-0 shrink-0">
          <span className="font-display text-lg font-medium">Coregit</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold truncate text-sm">
            {repoSlug || "demo"}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pill toggle */}
        <div className="flex items-center bg-muted/60 rounded-full p-0.5 shrink-0">
          <button
            onClick={() => setActivePanel("chat")}
            className={cn(
              "px-4 py-1 rounded-full text-xs font-medium transition-all",
              activePanel === "chat"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Chat
          </button>
          <button
            onClick={() => setActivePanel("code")}
            className={cn(
              "px-4 py-1 rounded-full text-xs font-medium transition-all",
              activePanel === "code"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Code
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side: theme toggle + branch selector */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 text-foreground rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 text-foreground rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>
          {branches.length > 0 && onSwitchBranch && (
            <div className="relative">
              <select
                value={activeBranch}
                onChange={(e) => onSwitchBranch(e.target.value)}
                className="appearance-none flex items-center gap-1.5 pl-7 pr-6 py-1 rounded-md border border-input bg-background text-xs font-mono cursor-pointer hover:bg-muted/50 transition-colors"
              >
                {branches.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <GitBranch className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
            </div>
          )}
        </div>
      </header>

      {/* Panel content */}
      {activePanel === "chat" ? (
        <>
          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatMessages
              messages={messages}
              isStreaming={isStreaming}
              activeBranch={activeBranch}
              onPreviewSuggestion={onPreviewSuggestion}
              onAcceptSuggestion={onAcceptSuggestion}
              className="h-full"
            />
          </div>

          {/* Input */}
          <div className="shrink-0 px-4 pb-4">
            <PromptInput
              onSubmit={handleSend}
              disabled={isStreaming}
              isStreaming={isStreaming}
              onStop={stop}
            />
          </div>
        </>
      ) : (
        /* Code panel — inline file browser */
        <div className="flex flex-1 min-h-0">
          <ScrollArea className="w-48 border-r border-border/60 shrink-0">
            <FileExplorer
              items={fileTree}
              isLoading={isFileTreeLoading}
              onFileSelect={onFileSelect || (() => {})}
              selectedFile={selectedFile}
            />
          </ScrollArea>
          <div className="flex-1 min-w-0">
            <FileViewer
              repoSlug={repoSlug}
              filePath={selectedFile}
              activeBranch={activeBranch}
            />
          </div>
        </div>
      )}
    </div>
  );
}
