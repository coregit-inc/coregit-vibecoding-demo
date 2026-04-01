"use client";

import { useRef, useEffect, useState } from "react";
import { X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

// Strip all ANSI escape sequences
function stripAnsi(str: string): string {
  return str.replace(
    // eslint-disable-next-line no-control-regex
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
}

interface TerminalOutputProps {
  logs: string[];
}

export function TerminalOutput({ logs }: TerminalOutputProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (logs.length === 0) return null;

  const cleaned = logs
    .map(stripAnsi)
    .map((l) => l.trim())
    .filter((l) => l.length > 1); // filter spinner chars (-, /, \, |) and empty

  if (cleaned.length === 0) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 border-t border-border/60 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Terminal className="size-3" />
        Terminal ({cleaned.length} lines)
      </button>
    );
  }

  return (
    <div className="border-t border-border/60">
      <div className="flex items-center justify-between px-3 py-1 bg-card/30">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Terminal className="size-3" />
          Terminal
        </span>
        <Button variant="ghost" size="icon-sm" onClick={() => setIsOpen(false)}>
          <X className="size-3" />
        </Button>
      </div>
      <div className="bg-card/50 max-h-40 overflow-auto font-mono text-xs p-3">
        {cleaned.map((line, i) => (
          <div key={i} className="text-muted-foreground whitespace-pre-wrap">
            {line}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
