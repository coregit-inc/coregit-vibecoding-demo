export interface Template {
  slug: string;
  title: string;
  description: string;
  icon: string;
  tags: string[];
}

export const TEMPLATES: Template[] = [
  {
    slug: "templates/react-vite",
    title: "React + Vite",
    description: "React 19 with Vite, TypeScript, and Tailwind CSS v4",
    icon: "react",
    tags: ["React", "Vite", "Tailwind"],
  },
  {
    slug: "templates/nextjs",
    title: "Next.js",
    description: "Next.js 16 with App Router, TypeScript, and Tailwind CSS",
    icon: "nextjs",
    tags: ["Next.js", "React", "Full-stack"],
  },
  {
    slug: "templates/hono-api",
    title: "API Server",
    description: "Hono API with TypeScript, ready for Cloudflare Workers",
    icon: "api",
    tags: ["Hono", "API", "Workers"],
  },
  {
    slug: "templates/vanilla-ts",
    title: "Vanilla TypeScript",
    description: "Minimal Vite + TypeScript setup without any framework",
    icon: "typescript",
    tags: ["TypeScript", "Vite", "Minimal"],
  },
];
