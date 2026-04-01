"use client";

import { useState, useRef } from "react";

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M9 9h10v10H9V9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M20 7 10.5 16.5 4 10"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      aria-label="Copy"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center rounded-md border border-border/50 bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors h-7 w-7 ${className ?? ""}`}
    >
      <span className="relative block h-3.5 w-3.5">
        <CheckIcon
          className={`absolute inset-0 h-3.5 w-3.5 transition-all duration-200 ${
            copied ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        />
        <CopyIcon
          className={`absolute inset-0 h-3.5 w-3.5 transition-all duration-200 ${
            copied ? "opacity-0 scale-90" : "opacity-100 scale-100"
          }`}
        />
      </span>
    </button>
  );
}
