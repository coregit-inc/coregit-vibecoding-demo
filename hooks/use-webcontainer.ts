"use client";

import { useState, useRef, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import { fetchFilesAsTree, collectAllFilePaths } from "@/lib/webcontainer";

type Status = "idle" | "booting" | "ready" | "syncing" | "installing" | "running" | "error";

export function useWebContainer() {
  const instanceRef = useRef<WebContainer | null>(null);
  const bootPromiseRef = useRef<Promise<WebContainer | null> | null>(null);
  const devProcessRef = useRef<{ kill: () => void } | null>(null);
  const hasRunBefore = useRef(false);
  const [status, setStatus] = useState<Status>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((line: string) => {
    setLogs((prev) => [...prev.slice(-200), line]);
  }, []);

  const ensureBoot = useCallback(async (): Promise<WebContainer | null> => {
    if (instanceRef.current) return instanceRef.current;

    // Reuse existing boot promise to prevent double boot
    if (bootPromiseRef.current) return bootPromiseRef.current;

    const promise = (async () => {
      setStatus("booting");
      try {
        const wc = await WebContainer.boot();
        instanceRef.current = wc;
        wc.on("server-ready", (_port, url) => {
          console.log("[WebContainer] server-ready:", _port, url);
          setPreviewUrl(url);
        });
        wc.on("error", (err) => {
          console.error("[WebContainer] error:", err);
        });
        setStatus("ready");
        return wc;
      } catch (err) {
        console.error("WebContainer boot failed:", err);
        setStatus("error");
        bootPromiseRef.current = null;
        return null;
      }
    })();

    bootPromiseRef.current = promise;
    return promise;
  }, []);

  const syncAndRun = useCallback(
    async (repoSlug: string, changedFiles?: string[]) => {
      const wc = await ensureBoot();
      if (!wc) return;

      setStatus("syncing");

      let filePaths: string[];
      if (!hasRunBefore.current || !changedFiles) {
        filePaths = await collectAllFilePaths(repoSlug);
        hasRunBefore.current = true;
      } else {
        filePaths = changedFiles;
      }

      if (filePaths.length === 0) return;

      const tree = await fetchFilesAsTree(repoSlug, filePaths);
      await wc.mount(tree);

      const needsInstall =
        !changedFiles || changedFiles.some((f) => f === "package.json");

      if (needsInstall) {
        setStatus("installing");
        addLog("$ npm install");

        const installProcess = await wc.spawn("npm", ["install"]);
        installProcess.output.pipeTo(new WritableStream({
          write(chunk) { addLog(chunk); },
        })).catch(() => {});
        const exitCode = await installProcess.exit;

        if (exitCode !== 0) {
          addLog(`npm install failed with exit code ${exitCode}`);
          setStatus("error");
          return;
        }
      }

      if (devProcessRef.current) {
        devProcessRef.current.kill();
        devProcessRef.current = null;
        await new Promise((r) => setTimeout(r, 500));
      }

      setStatus("running");
      addLog("$ npm run dev");

      const devProcess = await wc.spawn("npm", ["run", "dev"]);
      devProcessRef.current = devProcess;
      devProcess.output.pipeTo(new WritableStream({
        write(chunk) { addLog(chunk); },
      })).catch(() => {});
    },
    [ensureBoot, addLog]
  );

  return { status, previewUrl, logs, syncAndRun };
}
