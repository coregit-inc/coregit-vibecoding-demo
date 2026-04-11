"use client";

import { useState, useCallback } from "react";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type SearchMode = "text" | "semantic" | "hybrid";

interface SearchResult {
  file: string;
  line?: number;
  content?: string;
  snippet?: string;
  score?: number;
  context_before?: string[];
  context_after?: string[];
}

interface SearchPanelProps {
  repoSlug: string | null;
  activeBranch: string;
  onFileSelect?: (path: string) => void;
  onSwitchToCode?: () => void;
}

export function SearchPanel({
  repoSlug,
  activeBranch,
  onFileSelect,
  onSwitchToCode,
}: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("text");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!repoSlug || !query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      let endpoint: string;
      let body: Record<string, unknown>;

      switch (mode) {
        case "text":
          endpoint = "/api/search";
          body = { slug: repoSlug, query: query.trim(), ref: activeBranch, max_results: 30 };
          break;
        case "semantic":
          endpoint = "/api/search/semantic";
          body = { slug: repoSlug, query: query.trim(), ref: activeBranch, top_k: 20 };
          break;
        case "hybrid":
          endpoint = "/api/search/hybrid";
          body = { slug: repoSlug, query: query.trim(), ref: activeBranch, include_graph: true };
          break;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Search error:", data.error);
        setResults([]);
        setTotal(0);
        return;
      }

      const data = await res.json();

      if (mode === "text") {
        const matches = (data.matches ?? []) as Array<{
          path: string;
          line: number;
          content: string;
          context_before: string[];
          context_after: string[];
        }>;
        setResults(
          matches.map((m) => ({
            file: m.path,
            line: m.line,
            content: m.content,
            context_before: m.context_before,
            context_after: m.context_after,
          }))
        );
        setTotal(data.total ?? matches.length);
      } else if (mode === "semantic") {
        const items = (data.results ?? []) as Array<{
          file_path: string;
          snippet: string;
          score: number;
          start_line: number;
        }>;
        setResults(
          items.map((r) => ({
            file: r.file_path,
            line: r.start_line,
            snippet: r.snippet,
            score: r.score,
          }))
        );
        setTotal(items.length);
      } else {
        const items = (data.results ?? []) as Array<{
          file_path: string;
          name: string;
          snippet?: string;
          score: number;
          start_line?: number;
        }>;
        setResults(
          items.map((r) => ({
            file: r.file_path,
            line: r.start_line,
            snippet: r.snippet ?? r.name,
            score: r.score,
          }))
        );
        setTotal(items.length);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
      setTotal(0);
    } finally {
      setIsSearching(false);
    }
  }, [repoSlug, query, mode, activeBranch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  const handleResultClick = useCallback(
    (file: string) => {
      onFileSelect?.(file);
      onSwitchToCode?.();
    },
    [onFileSelect, onSwitchToCode]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search input + mode toggle */}
      <div className="px-4 pt-4 pb-3 space-y-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder={
                mode === "text"
                  ? "Search code..."
                  : mode === "semantic"
                    ? "Describe what you're looking for..."
                    : "Smart search..."
              }
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setQuery(e.target.value)
              }
              onKeyDown={handleKeyDown}
              className="pl-9"
              size="sm"
            />
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-muted/60 rounded-full p-0.5 w-fit">
          {(
            [
              { key: "text", label: "Text" },
              { key: "semantic", label: "Semantic" },
              { key: "hybrid", label: "Hybrid" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                mode === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {key === "semantic" || key === "hybrid" ? (
                <span className="flex items-center gap-1">
                  <Sparkles className="size-3" />
                  {label}
                </span>
              ) : (
                label
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 pb-4 space-y-1.5">
          {isSearching && (
            <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground text-sm">
              <Loader2 className="size-4 animate-spin" />
              Searching...
            </div>
          )}

          {!isSearching && hasSearched && results.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No results found
            </div>
          )}

          {!isSearching && hasSearched && results.length > 0 && (
            <p className="text-xs text-muted-foreground mb-2">
              {total} result{total !== 1 ? "s" : ""}
            </p>
          )}

          {!isSearching &&
            results.map((r, i) => (
              <button
                key={`${r.file}-${r.line}-${i}`}
                onClick={() => handleResultClick(r.file)}
                className="w-full text-left rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/50 transition-colors p-2.5 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-foreground truncate">
                    {r.file}
                  </span>
                  {r.line != null && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      L{r.line}
                    </Badge>
                  )}
                  {r.score != null && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {Math.round(r.score * 100)}%
                    </Badge>
                  )}
                </div>
                {(r.content || r.snippet) && (
                  <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-all line-clamp-3">
                    {r.content || r.snippet}
                  </pre>
                )}
              </button>
            ))}

          {!hasSearched && !isSearching && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              {repoSlug
                ? "Type a query and press Enter to search"
                : "Start a chat to create a repo first"}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
