#!/usr/bin/env node
/**
 * Vercel / CI install entrypoint.
 * Runs `pnpm install` from the monorepo root (finds pnpm-workspace.yaml).
 * On minimumReleaseAge lockfile failures, auto-repairs once and retries.
 *
 * Never sets minimumReleaseAge to 0.
 *
 * Works when Vercel Root Directory is the repo root or apps/web.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  isAgeViolationOutput,
  parseAgeViolations,
} from "./lib/pnpm-age-policy.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findMonorepoRoot() {
  const starts = [process.cwd(), path.resolve(__dirname, "..")];
  for (const start of starts) {
    let dir = start;
    for (;;) {
      if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir;
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  return path.resolve(__dirname, "..");
}

const root = findMonorepoRoot();

function runPnpmInstall() {
  const result = spawnSync("pnpm", ["install"], {
    cwd: root,
    encoding: "utf8",
    shell: true,
    env: process.env,
  });
  const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  return { code: result.status ?? 1, combined };
}

function runRepair(logText) {
  const logPath = path.join(os.tmpdir(), `pnpm-age-${process.pid}.log`);
  fs.writeFileSync(logPath, logText, "utf8");
  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts", "repair-pnpm-release-age.mjs"), "--from-log", logPath],
    {
      cwd: root,
      encoding: "utf8",
      env: process.env,
    },
  );
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  try {
    fs.unlinkSync(logPath);
  } catch {
    /* ignore */
  }
  return result.status ?? 1;
}

function main() {
  console.error(`pnpm install (workspace root: ${root})`);

  const first = runPnpmInstall();
  if (first.code === 0) {
    process.exit(0);
  }

  if (!isAgeViolationOutput(first.combined)) {
    console.error("\npnpm install failed for a non-release-age reason; not auto-repairing.");
    process.exit(first.code);
  }

  const violations = parseAgeViolations(first.combined);
  console.error(
    `\nDetected ${violations.length} minimumReleaseAge violation(s). Running security-preserving repair…`,
  );

  const repairCode = runRepair(first.combined);
  if (repairCode !== 0) {
    console.error("Auto-repair could not resolve all violations.");
    process.exit(repairCode);
  }

  const second = runPnpmInstall();
  if (second.code !== 0) {
    console.error(
      "\nInstall still failing after repair. Commit a local `pnpm install` fix or inspect overrides.",
    );
    process.exit(second.code);
  }

  console.error(
    "\nInstall succeeded after policy repair. Commit pnpm-workspace.yaml + pnpm-lock.yaml so the next build skips repair.",
  );
  process.exit(0);
}

main();
