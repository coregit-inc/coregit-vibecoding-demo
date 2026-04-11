"use client";

import { useState } from "react";
import { Code, Globe, Server, FileCode, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TEMPLATES, type Template } from "@/lib/templates";

interface TemplateGalleryProps {
  onSelectTemplate: (templateSlug: string) => void;
  onStartFromScratch: () => void;
  isLoading?: boolean;
  loadingSlug?: string | null;
}

function getTemplateIcon(icon: string) {
  switch (icon) {
    case "react":
      return <Code className="size-6" />;
    case "nextjs":
      return <Globe className="size-6" />;
    case "api":
      return <Server className="size-6" />;
    case "typescript":
      return <FileCode className="size-6" />;
    default:
      return <Code className="size-6" />;
  }
}

export function TemplateGallery({
  onSelectTemplate,
  onStartFromScratch,
  isLoading,
  loadingSlug,
}: TemplateGalleryProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Start a new project</h2>
          <p className="text-sm text-muted-foreground">
            Pick a template or start from scratch — describe what you want to build.
          </p>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((template) => (
            <button
              key={template.slug}
              onClick={() => onSelectTemplate(template.slug)}
              disabled={isLoading}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-muted/20 p-4 text-left transition-all",
                "hover:bg-muted/50 hover:border-border",
                isLoading && loadingSlug === template.slug && "border-primary/50 bg-primary/5",
                isLoading && loadingSlug !== template.slug && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="text-muted-foreground">
                  {isLoading && loadingSlug === template.slug ? (
                    <Loader2 className="size-6 animate-spin text-primary" />
                  ) : (
                    getTemplateIcon(template.icon)
                  )}
                </div>
                <span className="font-medium text-sm">{template.title}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-border/40" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 border-t border-border/40" />
        </div>

        {/* Start from scratch */}
        <button
          onClick={onStartFromScratch}
          disabled={isLoading}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10 p-4 transition-all",
            "hover:bg-muted/30 hover:border-border",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          <Sparkles className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Start from scratch</span>
          <span className="text-xs text-muted-foreground">— just describe what you want</span>
        </button>
      </div>
    </div>
  );
}
