"use client";

import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import CodeMirror, { type ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { Loader2 } from "lucide-react";

const coregitDark = createTheme({
  theme: "dark",
  settings: {
    background: "#3a2f3b",
    foreground: "#f1f0ea",
    caret: "#f1f0ea",
    selection: "rgba(241, 240, 234, 0.12)",
    selectionMatch: "rgba(241, 240, 234, 0.08)",
    lineHighlight: "rgba(241, 240, 234, 0.04)",
    gutterBackground: "#3a2f3b",
    gutterForeground: "#a09a9e",
    gutterBorder: "transparent",
  },
  styles: [
    { tag: t.comment, color: "#7a6f7c" },
    { tag: t.string, color: "#d4a276" },
    { tag: t.number, color: "#d4a276" },
    { tag: t.keyword, color: "#c4a1d0" },
    { tag: t.definition(t.variableName), color: "#8ecae6" },
    { tag: t.variableName, color: "#f1f0ea" },
    { tag: t.function(t.variableName), color: "#8ecae6" },
    { tag: t.typeName, color: "#c4a1d0" },
    { tag: t.tagName, color: "#c4a1d0" },
    { tag: t.attributeName, color: "#8ecae6" },
    { tag: t.operator, color: "#a09a9e" },
    { tag: t.punctuation, color: "#a09a9e" },
    { tag: t.propertyName, color: "#8ecae6" },
    { tag: t.bool, color: "#d4a276" },
    { tag: t.null, color: "#d4a276" },
  ],
});

const coregitLight = createTheme({
  theme: "light",
  settings: {
    background: "#e0ddcf",
    foreground: "#2d232e",
    caret: "#2d232e",
    selection: "rgba(45, 35, 46, 0.12)",
    selectionMatch: "rgba(45, 35, 46, 0.08)",
    lineHighlight: "rgba(45, 35, 46, 0.04)",
    gutterBackground: "#e0ddcf",
    gutterForeground: "#534b52",
    gutterBorder: "transparent",
  },
  styles: [
    { tag: t.comment, color: "#7a6f7c" },
    { tag: t.string, color: "#9a5830" },
    { tag: t.number, color: "#9a5830" },
    { tag: t.keyword, color: "#7b3f8d" },
    { tag: t.definition(t.variableName), color: "#1a6b8a" },
    { tag: t.variableName, color: "#2d232e" },
    { tag: t.function(t.variableName), color: "#1a6b8a" },
    { tag: t.typeName, color: "#7b3f8d" },
    { tag: t.tagName, color: "#7b3f8d" },
    { tag: t.attributeName, color: "#1a6b8a" },
    { tag: t.operator, color: "#534b52" },
    { tag: t.punctuation, color: "#534b52" },
    { tag: t.propertyName, color: "#1a6b8a" },
    { tag: t.bool, color: "#9a5830" },
    { tag: t.null, color: "#9a5830" },
  ],
});

interface FileViewerProps {
  repoSlug: string | null;
  filePath: string | null;
  activeBranch?: string;
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

export function FileViewer({ repoSlug, filePath, activeBranch = "main" }: FileViewerProps) {
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
      ref: activeBranch,
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
  }, [repoSlug, filePath, activeBranch]);

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
        theme={resolvedTheme === "dark" ? coregitDark : coregitLight}
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
