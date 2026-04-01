"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { Loader2 } from "lucide-react";

interface FileViewerProps {
  repoSlug: string | null;
  filePath: string | null;
}

function getLanguageExtension(path: string) {
  const ext = path.split(".").pop() || "";
  switch (ext) {
    case "ts":
    case "tsx":
      return javascript({ jsx: true, typescript: true });
    case "js":
    case "jsx":
      return javascript({ jsx: true });
    case "html":
      return html();
    case "css":
      return css();
    case "json":
      return json();
    default:
      return javascript();
  }
}

export function FileViewer({ repoSlug, filePath }: FileViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!repoSlug || !filePath) {
      setContent(null);
      return;
    }

    setIsLoading(true);
    const params = new URLSearchParams({
      slug: repoSlug,
      ref: "main",
      path: filePath,
    });
    fetch(`/api/files/blob?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setContent(data.content || "");
      })
      .catch(() => {
        setContent("// Failed to load file");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [repoSlug, filePath]);

  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Select a file to view its contents
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <Loader2 className="size-4 animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border/60 font-mono">
        {filePath}
      </div>
      <CodeMirror
        value={content || ""}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        extensions={[getLanguageExtension(filePath)]}
        readOnly
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: false,
        }}
        className="text-sm"
      />
    </div>
  );
}
