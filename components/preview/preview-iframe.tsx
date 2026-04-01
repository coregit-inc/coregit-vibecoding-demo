"use client";

import { Loader2, Globe } from "lucide-react";

interface PreviewIframeProps {
  url: string | null;
  status: string;
}

export function PreviewIframe({ url, status }: PreviewIframeProps) {
  if (!url) {
    // Booting/syncing/installing/running — show loading
    const isLoading = status === "booting" || status === "syncing" || status === "installing" || status === "running";
    const statusLabels: Record<string, string> = {
      booting: "Starting preview environment",
      syncing: "Syncing files",
      installing: "Installing dependencies",
      running: "Starting dev server",
    };

    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        {isLoading ? (
          <>
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">{statusLabels[status] || status}...</p>
          </>
        ) : status === "error" ? (
          <>
            <Globe className="size-8 opacity-40" />
            <p className="text-sm text-destructive">Preview failed to load</p>
            <p className="text-xs">Check the terminal for errors</p>
          </>
        ) : (
          <>
            <Globe className="size-8 opacity-40" />
            <p className="text-sm">Preview will appear here</p>
            <p className="text-xs">Send a message to generate code</p>
          </>
        )}
      </div>
    );
  }

  return (
    <iframe
      src={url}
      className="w-full h-full border-0 bg-white rounded-b-lg"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      title="Preview"
    />
  );
}
