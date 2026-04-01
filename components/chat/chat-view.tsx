"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatMessages } from "./chat-messages";
import { PromptInput } from "./prompt-input";

interface ChatViewProps {
  repoSlug: string | null;
  ensureRepo: () => Promise<string>;
  onFilesChanged?: (files: string[]) => void;
}

export function ChatView({ repoSlug, ensureRepo, onFilesChanged }: ChatViewProps) {
  const {
    messages,
    sendMessage,
    status,
    stop,
  } = useChat({
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

  const { theme, setTheme } = useTheme();
  const isStreaming = status === "streaming" || status === "submitted";

  const handleSend = useCallback(
    async (prompt: string) => {
      const slug = await ensureRepo();
      sendMessage(
        { text: prompt },
        { body: { repoSlug: slug } }
      );
    },
    [ensureRepo, sendMessage]
  );

  return (
    <div className="flex flex-col overflow-hidden min-w-0 h-full">
      {/* Header */}
      <header className="flex h-14 items-center justify-center px-4 relative shrink-0">
        <div className="absolute left-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 text-foreground rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 text-foreground rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
        <div className="flex items-center gap-1.5 max-w-[calc(100%-4rem)] min-w-0">
          <span className="font-display text-lg font-medium">Coregit</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold truncate">
            {repoSlug || "demo"}
          </span>
          {repoSlug && (
            <Badge variant="outline" className="ml-1 shrink-0 text-xs">
              public
            </Badge>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatMessages
          messages={messages}
          isStreaming={isStreaming}
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
    </div>
  );
}
