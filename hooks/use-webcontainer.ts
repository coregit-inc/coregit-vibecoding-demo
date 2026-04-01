"use client";

import { useState, useRef, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import { fetchFilesAsTree, collectAllFilePaths } from "@/lib/webcontainer";

type Status = "idle" | "booting" | "ready" | "syncing" | "installing" | "running" | "error";

export function useWebContainer() {
  const instanceRef = useRef<WebContainer | null>(null);
  const devProcessRef = useRef<{ kill: () => void } | null>(null);
  const serverReadyRegistered = useRef(false);
  const hasRunBefore = useRef(false);
  const [status, setStatus] = useState<Status>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((line: string) => {
    setLogs((prev) => [...prev.slice(-200), line]);
  }, []);

  const bootingRef = useRef(false);

  const boot = useCallback(async () => {
    if (instanceRef.current || bootingRef.current) return;
    bootingRef.current = true;
    setStatus("booting");
    try {
      instanceRef.current = await WebContainer.boot();
      // Register server-ready once
      instanceRef.current.on("server-ready", (_port, url) => {
        console.log("[WebContainer] server-ready:", _port, url);
        setPreviewUrl(url);
      });
      instanceRef.current.on("error", (err) => {
        console.error("[WebContainer] error:", err);
        addLog(`WebContainer error: ${err.message}`);
      });
      serverReadyRegistered.current = true;
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

      // First run: always fetch ALL files to get full project
      // Subsequent runs: only sync changed files
      let filePaths: string[];
      if (!hasRunBefore.current || !changedFiles) {
        filePaths = await collectAllFilePaths(repoSlug);
        hasRunBefore.current = true;
      } else {
        filePaths = changedFiles;
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
        // Small delay to let the port free up
        await new Promise((r) => setTimeout(r, 500));
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
    },
    [boot, addLog]
  );

  return { status, previewUrl, logs, boot, syncAndRun };
}
