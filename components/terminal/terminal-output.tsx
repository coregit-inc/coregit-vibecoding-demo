"use client";

import { useRef, useEffect } from "react";

// Strip ANSI escape codes (colors, cursor control, etc.)
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]|\x1B\].*?\x07/g, "");
}

interface TerminalOutputProps {
  logs: string[];
}

export function TerminalOutput({ logs }: TerminalOutputProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (logs.length === 0) return null;

  // Clean and filter empty lines
  const cleaned = logs
    .map(stripAnsi)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (cleaned.length === 0) return null;

  return (
    <div className="bg-card/50 border-t border-border/60 max-h-40 overflow-auto font-mono text-xs p-3">
      {cleaned.map((line, i) => (
        <div key={i} className="text-muted-foreground whitespace-pre-wrap">
          {line}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
