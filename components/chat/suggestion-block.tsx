"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Eye,
  Check,
  Loader2,
  Sparkles,
  Undo2,
} from "lucide-react";

interface Suggestion {
  title: string;
  description: string;
  branch: string;
  filesWritten: string[];
}

interface SuggestionGroupProps {
  suggestions: Suggestion[];
  activeBranch?: string;
  mergingBranch?: string | null;
  onPreview: (branch: string) => void;
  onAccept: (branch: string) => void;
  onBackToMain: () => void;
}

export function SuggestionGroup({
  suggestions,
  activeBranch,
  mergingBranch,
  onPreview,
  onAccept,
  onBackToMain,
}: SuggestionGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-background overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 hover:bg-muted/40 transition-colors"
      >
        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="size-3.5 text-primary" />
        </div>
        <span className="text-sm font-medium flex-1 text-left">
          {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""}{" "}
          from Coregit
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            !isOpen && "-rotate-90"
          )}
        />
      </button>

      {/* Suggestion cards */}
      {isOpen && (
        <div className="px-3.5 pb-3 space-y-2">
          {suggestions.map((suggestion) => {
            const isPreviewing = suggestion.branch === activeBranch;
            const isMerging = suggestion.branch === mergingBranch;

            return (
              <div
                key={suggestion.branch}
                className={cn(
                  "rounded-lg border p-3 transition-all",
                  isPreviewing
                    ? "border-primary/40 ring-2 ring-primary/15 bg-primary/4"
                    : "border-border/50 bg-card"
                )}
              >
                {/* Title */}
                <h4
                  className={cn(
                    "text-sm font-semibold",
                    isPreviewing ? "text-primary" : "text-foreground"
                  )}
                >
                  {suggestion.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {suggestion.description}
                </p>

                {/* Actions */}
                <div className="mt-3">
                  {isPreviewing ? (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        disabled={isMerging}
                        onClick={() => onAccept(suggestion.branch)}
                      >
                        {isMerging ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Check className="size-3.5" />
                        )}
                        {isMerging ? "Merging..." : "Accept"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isMerging}
                        onClick={onBackToMain}
                      >
                        <Undo2 className="size-3.5" />
                        Back
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => onPreview(suggestion.branch)}
                    >
                      <Eye className="size-3.5" />
                      Preview
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Single suggestion block — kept for backward compat when there's only one */
interface SuggestionBlockProps {
  title: string;
  description: string;
  branch: string;
  filesWritten: string[];
  isActive: boolean;
  isLoading?: boolean;
  onPreview: (branch: string) => void;
  onAccept: (branch: string) => void;
}

export function SuggestionBlock({
  title,
  description,
  branch,
  filesWritten,
  isActive,
  isLoading,
  onPreview,
  onAccept,
}: SuggestionBlockProps) {
  return (
    <SuggestionGroup
      suggestions={[{ title, description, branch, filesWritten }]}
      activeBranch={isActive ? branch : undefined}
      mergingBranch={isLoading ? branch : null}
      onPreview={onPreview}
      onAccept={onAccept}
      onBackToMain={() => {}}
    />
  );
}
