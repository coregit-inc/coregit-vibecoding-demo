"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, File, Folder, Loader2 } from "lucide-react";
import type { TreeEntry } from "@/hooks/use-file-tree";

interface FileExplorerProps {
  items: TreeEntry[];
  isLoading: boolean;
  onFileSelect: (path: string) => void;
  selectedFile?: string | null;
}

export function FileExplorer({
  items,
  isLoading,
  onFileSelect,
  selectedFile,
}: FileExplorerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="size-4 animate-spin mr-2" />
        Loading files...
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  // Sort: folders first, then files, alphabetically
  const sorted = [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col text-sm">
      {sorted.map((item) => (
        <button
          key={item.path}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 hover:bg-muted/50 text-left transition-colors",
            selectedFile === item.path && "bg-muted"
          )}
          onClick={() => {
            if (item.type === "file") {
              onFileSelect(item.path);
            }
          }}
        >
          {item.type === "folder" ? (
            <Folder className="size-3.5 text-muted-foreground" />
          ) : (
            <File className="size-3.5 text-muted-foreground" />
          )}
          <span className="truncate">{item.name}</span>
        </button>
      ))}
    </div>
  );
}
