"use client";

import { useState, useRef, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import { fetchFilesAsTree, collectAllFilePaths } from "@/lib/webcontainer";

type Status = "idle" | "booting" | "ready" | "syncing" | "installing" | "running" | "error";

export function useWebContainer() {
  const instanceRef = useRef<WebContainer | null>(null);
  const devProcessRef = useRef<{ kill: () => void } | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((line: string) => {
    setLogs((prev) => [...prev.slice(-200), line]);
  }, []);

  const boot = useCallback(async () => {
    if (instanceRef.current) return;
    setStatus("booting");
    try {
      instanceRef.current = await WebContainer.boot();
      setStatus("ready");
    } catch (err) {
      console.error("WebContainer boot failed:", err);
      setStatus("error");
    }
  }, []);

  const syncAndRun = useCallback(
    async (repoSlug: string, changedFiles?: string[]) => {
      if (!instanceRef.current) {
        await boot();
      }
      const wc = instanceRef.current;
      if (!wc) return;

      setStatus("syncing");

      // Determine which files to sync
      let filePaths: string[];
      if (changedFiles && changedFiles.length > 0) {
        filePaths = changedFiles;
      } else {
        filePaths = await collectAllFilePaths(repoSlug);
      }

      if (filePaths.length === 0) return;

      // Fetch file contents and mount
      const tree = await fetchFilesAsTree(repoSlug, filePaths);
      await wc.mount(tree);

      // Check if package.json changed → need npm install
      const needsInstall =
        !changedFiles || changedFiles.some((f) => f === "package.json");

      if (needsInstall) {
        setStatus("installing");
        addLog("$ npm install");

        const installProcess = await wc.spawn("npm", ["install"]);
        const installWriter = new WritableStream({
          write(chunk) {
            addLog(chunk);
          },
        });
        installProcess.output.pipeTo(installWriter).catch(() => {});
        const exitCode = await installProcess.exit;

        if (exitCode !== 0) {
          addLog(`npm install failed with exit code ${exitCode}`);
          setStatus("error");
          return;
        }
      }

      // Kill existing dev server
      if (devProcessRef.current) {
        devProcessRef.current.kill();
        devProcessRef.current = null;
      }

      // Start dev server
      setStatus("running");
      addLog("$ npm run dev");

      const devProcess = await wc.spawn("npm", ["run", "dev"]);
      devProcessRef.current = devProcess;

      const devWriter = new WritableStream({
        write(chunk) {
          addLog(chunk);
        },
      });
      devProcess.output.pipeTo(devWriter).catch(() => {});

      // Listen for server ready
      wc.on("server-ready", (_port, url) => {
        setPreviewUrl(url);
      });
    },
    [boot, addLog]
  );

  return { status, previewUrl, logs, boot, syncAndRun };
}
