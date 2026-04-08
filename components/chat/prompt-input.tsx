"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Square, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
  placeholder?: string;
}

export function PromptInput({
  onSubmit,
  disabled = false,
  isStreaming = false,
  onStop,
  placeholder = "Ask Coregit...",
}: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasContent = prompt.trim().length > 0;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [prompt]);

  const handleSubmit = () => {
    if (hasContent && !disabled) {
      onSubmit(prompt);
      setPrompt("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-border/60 bg-background shadow-sm overflow-hidden">
        {/* Textarea */}
        <div className="px-4 pt-3 pb-1">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? "Waiting for response..." : placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Bottom bar with actions */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-0.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              title="Attach"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <button
            aria-label={isStreaming ? "Stop" : "Send"}
            onClick={isStreaming ? onStop : handleSubmit}
            disabled={isStreaming ? false : !hasContent || disabled}
            className={cn(
              "size-8 rounded-full flex items-center justify-center transition-all",
              isStreaming
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : hasContent && !disabled
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isStreaming ? (
              <Square className="size-3 fill-current" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
