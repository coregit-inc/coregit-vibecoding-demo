"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { motion, AnimatePresence } from "motion/react";

export type ConversationProps = ComponentProps<typeof StickToBottom> & {
  scrollFade?: boolean;
};

export const Conversation = ({ className, scrollFade = false, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn(
      "relative flex-1 overflow-y-hidden",
      scrollFade && "[mask-image:linear-gradient(to_bottom,transparent_0%,black_24px,black_calc(100%-24px),transparent_100%)]",
      className
    )}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
);

export type ConversationContentProps = ComponentProps<
  typeof StickToBottom.Content
>;

export const ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => (
  <StickToBottom.Content
    className={cn("flex flex-col gap-8 p-4", className)}
    {...props}
  />
);

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};

export const ConversationEmptyState = ({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn(
      "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div className="space-y-1">
          <h3 className="font-medium text-sm">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </>
    )}
  </div>
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    <AnimatePresence>
      {!isAtBottom && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.5, filter: "blur(12px)" }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="absolute bottom-3 left-[50%] translate-x-[-50%]"
        >
          <Button
            className={cn(
              "rounded-full !size-7 !min-h-0 dark:bg-background dark:hover:bg-muted",
              className
            )}
            onClick={handleScrollToBottom}
            size="icon"
            type="button"
            variant="outline"
            {...props}
          >
            <ArrowDownIcon className="!size-3" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
