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

interface ChatMessagesProps {
  messages: UIMessage[];
  isStreaming: boolean;
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
                      return (
                        <ToolBlock
                          key={part.toolCallId}
                          toolName={toolName}
                          args={(part.input ?? {}) as Record<string, unknown>}
                          result={
                            part.state === "output-available"
                              ? (part.output as Record<string, unknown>)
                              : undefined
                          }
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
