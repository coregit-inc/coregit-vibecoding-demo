"use client";

import { useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";

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
  placeholder = "Ask anything...",
}: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const hasContent = prompt.trim().length > 0;

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
      <InputGroup className="relative z-10 shadow-none before:shadow-none has-[input:focus-visible,textarea:focus-visible]:ring-0 has-[input:focus-visible,textarea:focus-visible]:border-input has-[input:focus-visible,textarea:focus-visible]:before:shadow-[0_1px_--theme(--color-black/6%)] dark:has-[input:focus-visible,textarea:focus-visible]:before:shadow-[0_-1px_--theme(--color-white/6%)] not-dark:bg-muted/60">
        <InputGroupTextarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? "Waiting..." : placeholder}
          disabled={disabled}
        />
        <InputGroupAddon align="block-end">
          <div className="ml-auto">
            <Button
              aria-label={isStreaming ? "Stop" : "Send"}
              className="rounded-full"
              size="icon-sm"
              variant="default"
              onClick={isStreaming ? onStop : handleSubmit}
              disabled={isStreaming ? false : !hasContent || disabled}
            >
              {isStreaming ? (
                <Square className="size-3 fill-current" />
              ) : (
                <ArrowUp />
              )}
            </Button>
          </div>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
