"use client";

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
import { SuggestionBlock } from "./suggestion-block";

interface ChatMessagesProps {
  messages: UIMessage[];
  isStreaming: boolean;
  activeBranch?: string;
  onPreviewSuggestion?: (branch: string) => void;
  onAcceptSuggestion?: (branch: string) => void;
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

export function ChatMessages({
  messages,
  isStreaming,
  activeBranch,
  onPreviewSuggestion,
  onAcceptSuggestion,
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
                  {message.parts.map((part, i) => {
                    if (isToolPart(part)) {
                      const toolName = part.type.replace("tool-", "");
                      const result = part.state === "output-available"
                        ? (part.output as Record<string, unknown>)
                        : undefined;

                      // Render suggestion as SuggestionBlock
                      if (toolName === "createSuggestion" && result?.suggestion) {
                        return (
                          <SuggestionBlock
                            key={part.toolCallId}
                            title={result.title as string}
                            description={result.description as string}
                            branch={result.branch as string}
                            filesWritten={(result.filesWritten as string[]) || []}
                            isActive={activeBranch === result.branch}
                            onPreview={onPreviewSuggestion || (() => {})}
                            onAccept={onAcceptSuggestion || (() => {})}
                          />
                        );
                      }

                      return (
                        <ToolBlock
                          key={part.toolCallId}
                          toolName={toolName}
                          args={(part.input ?? {}) as Record<string, unknown>}
                          result={result}
                          isLoading={
                            part.state !== "output-available" &&
                            part.state !== "error"
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
