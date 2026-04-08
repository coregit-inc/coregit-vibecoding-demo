"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  Eye,
  Check,
  Loader2,
  Merge,
} from "lucide-react";

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
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5 text-sm transition-all",
        isActive
          ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20"
          : "border-border/60 bg-muted/30 hover:border-border"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <GitBranch
          className={cn(
            "size-3.5 mt-0.5 shrink-0",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{title}</span>
            {isActive && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                previewing
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

      {/* Files */}
      {filesWritten.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-5.5">
          {filesWritten.slice(0, 5).map((f) => (
            <Badge key={f} variant="secondary" className="font-mono text-xs">
              {f}
            </Badge>
          ))}
          {filesWritten.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{filesWritten.length - 5} more
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-2.5 ml-5.5">
        <button
          onClick={() => onPreview(branch)}
          disabled={isActive || isLoading}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
            isActive
              ? "bg-primary/10 text-primary cursor-default"
              : "bg-muted hover:bg-accent text-foreground"
          )}
        >
          {isActive ? (
            <>
              <Check className="size-3" />
              Previewing
            </>
          ) : (
            <>
              <Eye className="size-3" />
              Preview
            </>
          )}
        </button>
        <button
          onClick={() => onAccept(branch)}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Merge className="size-3" />
          )}
          Accept
        </button>
      </div>
    </div>
  );
}
