"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  FilePlus,
  FileSearch,
  Folder,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  Search,
  Sparkles,
  GitGraph,
  GitFork,
} from "lucide-react";

interface ToolBlockProps {
  toolName: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
  isLoading?: boolean;
}

export function ToolBlock({ toolName, args, result, isLoading }: ToolBlockProps) {
  const label = getToolLabel(toolName, args, result);
  const files = getFileList(toolName, args, result);
  const hasError = result && "error" in result;
  const isDone = result && !hasError;

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border px-3 py-2 text-sm",
        hasError
          ? "border-destructive/30 bg-destructive/5"
          : isDone
            ? "border-success/20 bg-success/5"
            : "border-border/60 bg-muted/30"
      )}
    >
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground shrink-0" />
        ) : hasError ? (
          <AlertCircle className="size-3.5 text-destructive shrink-0" />
        ) : (
          <Check className="size-3.5 text-success-foreground shrink-0" />
        )}
        <span className={cn(
          "shrink-0",
          isDone ? "text-success-foreground" : "text-muted-foreground"
        )}>
          {getToolIcon(toolName)}
        </span>
        <span className={cn(
          "font-medium",
          isDone && "text-success-foreground"
        )}>
          {label}
        </span>
      </div>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1 ml-5.5">
          {files.map((f) => (
            <Badge
              key={f}
              variant={isDone ? "success" : "secondary"}
              className="font-mono text-xs"
            >
              {f}
            </Badge>
          ))}
        </div>
      )}
      {hasError && result?.error != null && (
        <p className="text-xs text-destructive ml-5.5">
          {String(result.error as string)}
        </p>
      )}
    </div>
  );
}

function getToolIcon(toolName: string) {
  switch (toolName) {
    case "commitFiles":
      return <FilePlus className="size-3.5" />;
    case "deleteFiles":
      return <Trash2 className="size-3.5" />;
    case "readFile":
      return <FileSearch className="size-3.5" />;
    case "listFiles":
      return <Folder className="size-3.5" />;
    case "createSuggestion":
      return <FilePlus className="size-3.5" />;
    case "searchCode":
      return <Search className="size-3.5" />;
    case "semanticSearch":
      return <Sparkles className="size-3.5" />;
    case "analyzeCode":
      return <GitGraph className="size-3.5" />;
    case "hybridSearch":
      return <Sparkles className="size-3.5" />;
    case "forkRepo":
      return <GitFork className="size-3.5" />;
    default:
      return null;
  }
}

function getToolLabel(
  toolName: string,
  args: Record<string, unknown>,
  result?: Record<string, unknown>
): string {
  switch (toolName) {
    case "commitFiles": {
      const files = args.files as Array<{ path: string }> | undefined;
      const count = files?.length || 0;
      return result
        ? `Committed ${count} file${count !== 1 ? "s" : ""}`
        : `Writing ${count} file${count !== 1 ? "s" : ""}...`;
    }
    case "deleteFiles": {
      const paths = args.paths as string[] | undefined;
      const count = paths?.length || 0;
      return result
        ? `Deleted ${count} file${count !== 1 ? "s" : ""}`
        : `Deleting ${count} file${count !== 1 ? "s" : ""}...`;
    }
    case "readFile":
      return result
        ? `Read ${args.path}`
        : `Reading ${args.path}...`;
    case "listFiles":
      return result
        ? `Listed ${(args.path as string) || "root"}`
        : `Listing ${(args.path as string) || "root"}...`;
    case "createSuggestion":
      return result
        ? `Created suggestion: ${args.title}`
        : `Creating suggestion: ${args.title}...`;
    case "searchCode": {
      const total = (result as Record<string, unknown> | undefined)?.total;
      return result
        ? `Found ${total ?? 0} match${total !== 1 ? "es" : ""}`
        : `Searching: ${args.query}...`;
    }
    case "semanticSearch": {
      const count = (
        (result as Record<string, unknown> | undefined)?.results as
          | unknown[]
          | undefined
      )?.length;
      return result
        ? `Found ${count ?? 0} result${count !== 1 ? "s" : ""}`
        : `Semantic search: ${args.query}...`;
    }
    case "analyzeCode":
      return result
        ? `Analyzed ${args.type}${args.name ? `: ${args.name}` : ""}`
        : `Analyzing ${args.type}${args.name ? `: ${args.name}` : ""}...`;
    case "hybridSearch": {
      const hCount = (
        (result as Record<string, unknown> | undefined)?.results as
          | unknown[]
          | undefined
      )?.length;
      return result
        ? `Smart search: ${hCount ?? 0} result${hCount !== 1 ? "s" : ""}`
        : `Smart search: ${args.query}...`;
    }
    case "forkRepo":
      return result
        ? `Forked ${args.source}`
        : `Forking ${args.source}...`;
    default:
      return toolName;
  }
}

function getFileList(
  toolName: string,
  args: Record<string, unknown>,
  _result?: Record<string, unknown>
): string[] {
  if (toolName === "commitFiles") {
    const files = args.files as Array<{ path: string }> | undefined;
    return files?.map((f) => f.path) || [];
  }
  if (toolName === "deleteFiles") {
    return (args.paths as string[]) || [];
  }
  return [];
}
