import type { FileSystemTree } from "@webcontainer/api";

/**
 * Fetches all files from a Coregit repo and converts them to WebContainer's FileSystemTree format.
 */
export async function fetchFilesAsTree(
  repoSlug: string,
  filePaths: string[],
  ref: string = "main"
): Promise<FileSystemTree> {
  const tree: FileSystemTree = {};

  const results = await Promise.all(
    filePaths.map(async (path) => {
      const params = new URLSearchParams({
        slug: repoSlug,
        ref,
        path,
      });
      const res = await fetch(`/api/files/blob?${params}`);
      if (!res.ok) return null;
      const data = await res.json();
      return { path, content: data.content as string };
    })
  );

  for (const result of results) {
    if (!result) continue;
    const parts = result.path.split("/");
    let current = tree;

    for (let i = 0; i < parts.length - 1; i++) {
      const dir = parts[i];
      if (!current[dir]) {
        current[dir] = { directory: {} };
      }
      const node = current[dir];
      if ("directory" in node) {
        current = node.directory;
      }
    }

    const fileName = parts[parts.length - 1];
    current[fileName] = {
      file: { contents: result.content },
    };
  }

  return tree;
}

/**
 * Recursively collects all file paths from a Coregit tree response.
 */
export async function collectAllFilePaths(
  repoSlug: string,
  basePath?: string,
  ref: string = "main"
): Promise<string[]> {
  const params = new URLSearchParams({ slug: repoSlug, ref });
  if (basePath) params.set("path", basePath);

  const res = await fetch(`/api/files/tree?${params}`);
  if (!res.ok) return [];
  const data = await res.json();

  const paths: string[] = [];

  for (const item of data.items || []) {
    if (item.type === "file") {
      paths.push(item.path);
    } else if (item.type === "folder") {
      const subPaths = await collectAllFilePaths(repoSlug, item.path, ref);
      paths.push(...subPaths);
    }
  }

  return paths;
}
