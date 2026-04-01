"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewIframeProps {
  url: string | null;
  status: string;
}

export function PreviewIframe({ url, status }: PreviewIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);

  // Detect if iframe loads or fails (Firefox cross-origin issue)
  useEffect(() => {
    if (!url) {
      setIframeLoaded(false);
      setIframeFailed(false);
      return;
    }

    setIframeLoaded(false);
    setIframeFailed(false);

    // If iframe hasn't loaded after 5s, show fallback
    const timeout = setTimeout(() => {
      if (!iframeLoaded) {
        setIframeFailed(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [url]);

  if (!url) {
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
    <div className="relative w-full h-full">
      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full border-0 rounded-b-lg"
        title="Preview"
        onLoad={() => setIframeLoaded(true)}
      />
      {/* Fallback: open in new window + browser hint */}
      {iframeFailed && !iframeLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/95 text-muted-foreground px-8 text-center">
          <Globe className="size-8 opacity-40" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Preview blocked by browser</p>
            <p className="text-xs max-w-sm">
              WebContainers require third-party cookies. In Firefox, go to Settings → Privacy → Cookies → Manage Exceptions and allow <code className="text-xs bg-muted px-1 rounded">webcontainer-api.io</code>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(url, "_blank")}
            >
              <ExternalLink className="size-3.5 mr-1.5" />
              Open in new window
            </Button>
          </div>
          <p className="text-xs opacity-60">Works best in Chrome</p>
        </div>
      )}
    </div>
  );
}
