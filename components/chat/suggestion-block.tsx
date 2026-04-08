"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  Eye,
  Check,
  Loader2,
  Merge,
  Sparkles,
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
  isLoading?: boolean;
  onPreview: (branch: string) => void;
  onAccept: (branch: string) => void;
}

export function SuggestionGroup({
  suggestions,
  activeBranch,
  isLoading,
  onPreview,
  onAccept,
}: SuggestionGroupProps) {
  const [isOpen, setIsOpen] = useState(true);
  const activeSuggestion = suggestions.find((s) => s.branch === activeBranch);
  const selectedBranch = activeSuggestion?.branch ?? null;

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
          {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""} from Coregit
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            !isOpen && "-rotate-90"
          )}
        />
      </button>

      {/* Suggestion options */}
      {isOpen && (
        <div className="px-3.5 pb-3 space-y-1">
          {suggestions.map((suggestion) => {
            const isActive = suggestion.branch === activeBranch;
            return (
              <button
                key={suggestion.branch}
                onClick={() => onPreview(suggestion.branch)}
                disabled={isActive}
                className={cn(
                  "flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors",
                  isActive
                    ? "bg-primary/8"
                    : "hover:bg-muted/50"
                )}
              >
                {/* Radio dot */}
                <div className="mt-0.5 shrink-0">
                  <div
                    className={cn(
                      "size-4 rounded-full border-2 transition-colors flex items-center justify-center",
                      isActive
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40"
                    )}
                  >
                    {isActive && (
                      <div className="size-1.5 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "text-sm font-medium",
                    isActive && "text-primary"
                  )}>
                    {suggestion.title}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {suggestion.description}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Accept bar — shown when a suggestion is being previewed */}
          {selectedBranch && (
            <div className="flex items-center gap-2 pt-2 mt-1 border-t border-border/40">
              <div className="flex items-center gap-1.5 text-xs text-primary flex-1">
                <Eye className="size-3" />
                <span>Previewing: {activeSuggestion?.title}</span>
              </div>
              <button
                onClick={() => onAccept(selectedBranch)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Merge className="size-3" />
                )}
                Accept & Merge
              </button>
            </div>
          )}
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
      isLoading={isLoading}
      onPreview={onPreview}
      onAccept={onAccept}
    />
  );
}
