"use client";

import { useMemo } from "react";
import type { UIMessage } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { ToolBlock } from "./tool-block";
import { SuggestionGroup } from "./suggestion-block";

interface ChatMessagesProps {
  messages: UIMessage[];
  isStreaming: boolean;
  activeBranch?: string;
  onPreviewSuggestion?: (branch: string) => void;
  onAcceptSuggestion?: (branch: string) => void;
  onBackToMain?: () => void;
  mergingBranch?: string | null;
  className?: string;
}

function isToolPart(
  part: UIMessage["parts"][number]
): part is UIMessage["parts"][number] & {
  toolCallId: string;
  state: string;
  input: unknown;
  output?: unknown;
} {
  return part.type.startsWith("tool-");
}

function getTextFromParts(parts: UIMessage["parts"]): string {
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

interface SuggestionData {
  title: string;
  description: string;
  branch: string;
  filesWritten: string[];
}

/** Group consecutive suggestion tool parts into batches */
function groupParts(parts: UIMessage["parts"]) {
  const groups: Array<
    | { type: "suggestion-group"; suggestions: SuggestionData[]; key: string }
    | { type: "part"; part: UIMessage["parts"][number]; index: number }
  > = [];

  let pendingSuggestions: SuggestionData[] = [];
  let suggestionKey = "";

  const flushSuggestions = () => {
    if (pendingSuggestions.length > 0) {
      groups.push({
        type: "suggestion-group",
        suggestions: [...pendingSuggestions],
        key: suggestionKey,
      });
      pendingSuggestions = [];
      suggestionKey = "";
    }
  };

  parts.forEach((part, i) => {
    if (isToolPart(part)) {
      const toolName = part.type.replace("tool-", "");
      const result =
        part.state === "output-available"
          ? (part.output as Record<string, unknown>)
          : undefined;

      if (toolName === "createSuggestion" && result?.suggestion) {
        pendingSuggestions.push({
          title: result.title as string,
          description: result.description as string,
          branch: result.branch as string,
          filesWritten: (result.filesWritten as string[]) || [],
        });
        if (!suggestionKey) suggestionKey = part.toolCallId;
        return;
      }
    }

    // Non-suggestion part — flush any pending suggestions first
    flushSuggestions();
    groups.push({ type: "part", part, index: i });
  });

  flushSuggestions();
  return groups;
}

export function ChatMessages({
  messages,
  isStreaming,
  activeBranch,
  onPreviewSuggestion,
  onAcceptSuggestion,
  onBackToMain,
  mergingBranch,
  className,
}: ChatMessagesProps) {
  return (
    <Conversation className={className}>
      <ConversationContent>
        {messages.map((message) => (
          <Message key={message.id} from={message.role as "user" | "assistant"}>
            <MessageContent>
              {message.role === "user" ? (
                <p>{getTextFromParts(message.parts)}</p>
              ) : (
                <>
                  {groupParts(message.parts).map((group) => {
                    if (group.type === "suggestion-group") {
                      return (
                        <SuggestionGroup
                          key={group.key}
                          suggestions={group.suggestions}
                          activeBranch={activeBranch}
                          mergingBranch={mergingBranch}
                          onPreview={onPreviewSuggestion || (() => {})}
                          onAccept={onAcceptSuggestion || (() => {})}
                          onBackToMain={onBackToMain || (() => {})}
                        />
                      );
                    }

                    const { part, index: i } = group;

                    if (isToolPart(part)) {
                      const toolName = part.type.replace("tool-", "");
                      const result =
                        part.state === "output-available"
                          ? (part.output as Record<string, unknown>)
                          : undefined;

                      return (
                        <ToolBlock
                          key={part.toolCallId}
                          toolName={toolName}
                          args={(part.input ?? {}) as Record<string, unknown>}
                          result={result}
                          isLoading={
                            part.state !== "output-available" &&
                            part.state !== "output-error"
                          }
                        />
                      );
                    }
                    if (part.type === "text" && part.text) {
                      return (
                        <MessageResponse
                          key={i}
                          mode={
                            isStreaming &&
                            i === message.parts.length - 1
                              ? "streaming"
                              : "static"
                          }
                        >
                          {part.text}
                        </MessageResponse>
                      );
                    }
                    return null;
                  })}
                </>
              )}
            </MessageContent>
          </Message>
        ))}
        {isStreaming &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking...</Shimmer>
              </MessageContent>
            </Message>
          )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
