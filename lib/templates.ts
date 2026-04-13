export interface Template {
  slug: string;
  title: string;
  description: string;
  icon: string;
  tags: string[];
  prompt: string;
}

export const TEMPLATES: Template[] = [
  {
    slug: "react-vite",
    title: "React + Vite",
    description: "React 19 with Vite, TypeScript, and Tailwind CSS v4",
    icon: "react",
    tags: ["React", "Vite", "Tailwind"],
    prompt: "Set up a React 19 project with Vite, TypeScript, and Tailwind CSS v4. Include a basic App component with a welcome page.",
  },
  {
    slug: "nextjs",
    title: "Next.js",
    description: "Next.js 16 with App Router, TypeScript, and Tailwind CSS",
    icon: "nextjs",
    tags: ["Next.js", "React", "Full-stack"],
    prompt: "Set up a Next.js 16 project with App Router, TypeScript, and Tailwind CSS. Include a basic layout and home page.",
  },
  {
    slug: "hono-api",
    title: "API Server",
    description: "Hono API with TypeScript, ready for Cloudflare Workers",
    icon: "api",
    tags: ["Hono", "API", "Workers"],
    prompt: "Set up a Hono API server with TypeScript. Include a basic GET / route returning JSON, and a health check endpoint.",
  },
  {
    slug: "vanilla-ts",
    title: "Vanilla TypeScript",
    description: "Minimal Vite + TypeScript setup without any framework",
    icon: "typescript",
    tags: ["TypeScript", "Vite", "Minimal"],
    prompt: "Set up a minimal Vite + TypeScript project without any framework. Include a basic counter app in vanilla TypeScript.",
  },
];

export function getTemplateBySlug(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}
