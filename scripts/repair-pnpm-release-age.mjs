#!/usr/bin/env node
/**
 * Repair ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION without disabling the gate.
 *
 * Strategy (security-first):
 * 1. Trusted high-churn org scopes → add to minimumReleaseAgeExclude
 * 2. Everything else → pin pnpm.overrides to newest version older than cutoff
 *
 * Usage:
 *   node scripts/repair-pnpm-release-age.mjs [--from-log path] [--dry-run]
 *   pnpm install 2>&1 | tee /tmp/pnpm.log; node scripts/repair-pnpm-release-age.mjs --from-log /tmp/pnpm.log
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  WORKSPACE_PATH,
  ensureMinimumReleaseAge,
  findMatureVersion,
  isTrustedHighChurn,
  parseAgeViolations,
  scopeExcludePattern,
  upsertExcludes,
  upsertOverrides,
} from "./lib/pnpm-age-policy.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const opts = { fromLog: null, dryRun: false, stdin: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--stdin") opts.stdin = true;
    else if (a === "--from-log") opts.fromLog = argv[++i];
    else if (a === "--help" || a === "-h") {
      console.log(`Usage: node scripts/repair-pnpm-release-age.mjs [--from-log path] [--stdin] [--dry-run]`);
      process.exit(0);
    }
  }
  return opts;
}

async function readInput(opts) {
  if (opts.fromLog) {
    return fs.readFileSync(path.resolve(opts.fromLog), "utf8");
  }
  if (opts.stdin || !process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString("utf8");
  }
  return "";
}

async function main() {
  const opts = parseArgs(process.argv);
  const text = await readInput(opts);
  const violations = parseAgeViolations(text);

  if (violations.length === 0) {
    console.error(
      "No minimumReleaseAge violations found in input. Pass --from-log <pnpm-install.log> or pipe install stderr.",
    );
    process.exit(2);
  }

  const workspaceFile = path.join(root, WORKSPACE_PATH);
  let yaml = fs.readFileSync(workspaceFile, "utf8");
  yaml = ensureMinimumReleaseAge(yaml);

  /** @type {string[]} */
  const excludes = [];
  /** @type {Record<string, string>} */
  const overrides = {};
  /** @type {string[]} */
  const notes = [];

  for (const v of violations) {
    if (isTrustedHighChurn(v.name)) {
      const pattern = scopeExcludePattern(v.name) ?? v.name;
      excludes.push(pattern);
      notes.push(`exclude ${pattern} (trusted high-churn; violated on ${v.name}@${v.version})`);
      continue;
    }

    const mature = await findMatureVersion(v.name, v.cutoff);
    if (!mature || mature === v.version) {
      notes.push(
        `FAIL ${v.name}@${v.version}: no older mature release before ${v.cutoff} — manual review required`,
      );
      continue;
    }
    overrides[v.name] = mature;
    notes.push(`override ${v.name}: ${v.version} → ${mature} (older than cutoff)`);
  }

  if (excludes.length) yaml = upsertExcludes(yaml, excludes);
  if (Object.keys(overrides).length) yaml = upsertOverrides(yaml, overrides);

  console.log("Repair plan:");
  for (const n of notes) console.log(`  - ${n}`);

  const unresolved = notes.filter((n) => n.startsWith("FAIL "));
  if (opts.dryRun) {
    console.log("\n(dry-run) pnpm-workspace.yaml not written");
    process.exit(unresolved.length ? 1 : 0);
  }

  fs.writeFileSync(workspaceFile, yaml.endsWith("\n") ? yaml : `${yaml}\n`, "utf8");
  console.log(`\nUpdated ${WORKSPACE_PATH}`);
  console.log("Next: run `pnpm install` and commit pnpm-workspace.yaml + pnpm-lock.yaml");

  if (unresolved.length) {
    console.error("\nSome packages could not be auto-repaired.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
