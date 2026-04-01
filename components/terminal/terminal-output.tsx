"use client";

import { useRef, useEffect } from "react";

interface TerminalOutputProps {
  logs: string[];
}

export function TerminalOutput({ logs }: TerminalOutputProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <div className="bg-card/50 border-t border-border/60 max-h-40 overflow-auto font-mono text-xs p-3">
      {logs.map((line, i) => (
        <div key={i} className="text-muted-foreground whitespace-pre-wrap">
          {line}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
