/**
 * Shared policy for pnpm minimumReleaseAge repair.
 * Keep the age gate on; only auto-exclude org-backed high-churn scopes.
 * Everything else is pinned to the newest version older than the cutoff.
 */

export const MINIMUM_RELEASE_AGE_MINUTES = 1440;

/** Scopes that publish near-daily from large orgs — exclude from the age gate. */
export const TRUSTED_HIGH_CHURN_SCOPES = [
  "@aws-sdk/",
  "@aws-crypto/",
  "@aws/",
  "@smithy/",
  "@google-cloud/",
  "@grpc/",
  "@opentelemetry/",
  "@azure/",
  "@azure-rest/",
  "@microsoft/",
];

export const WORKSPACE_PATH = "pnpm-workspace.yaml";

export function scopeExcludePattern(pkgName) {
  if (!pkgName.startsWith("@")) return null;
  const slash = pkgName.indexOf("/");
  if (slash === -1) return null;
  return `${pkgName.slice(0, slash)}/*`;
}

export function isTrustedHighChurn(pkgName) {
  return TRUSTED_HIGH_CHURN_SCOPES.some((prefix) => pkgName.startsWith(prefix));
}

/** @returns {{ name: string, version: string, publishedAt: string, cutoff: string }[]} */
export function parseAgeViolations(text) {
  const re =
    /^\s{2}(.+?)@([^ ]+) was published at ([^,]+), within the minimumReleaseAge cutoff \(([^)]+)\)/gm;
  const out = [];
  for (const match of text.matchAll(re)) {
    out.push({
      name: match[1],
      version: match[2],
      publishedAt: match[3],
      cutoff: match[4],
    });
  }
  return out;
}

export function isAgeViolationOutput(text) {
  return (
    text.includes("ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION") ||
    text.includes("failed supply-chain policy check")
  );
}

/**
 * Newest version of `name` with publish time strictly before `cutoffIso`.
 * @returns {Promise<string | null>}
 */
export async function findMatureVersion(name, cutoffIso) {
  const cutoff = Date.parse(cutoffIso);
  if (Number.isNaN(cutoff)) return null;

  // Scoped names must use @scope%2Fpkg (not fully URI-encoded).
  const url = `https://registry.npmjs.org/${name.replace("/", "%2F")}`;
  const res = await fetch(url, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const times = data.time ?? {};
  /** @type {{ version: string, t: number }[]} */
  const candidates = [];
  for (const [version, iso] of Object.entries(times)) {
    if (version === "created" || version === "modified") continue;
    if (String(version).includes("-")) continue; // skip prereleases for safety
    const t = Date.parse(String(iso));
    if (Number.isNaN(t) || t >= cutoff) continue;
    candidates.push({ version, t });
  }
  candidates.sort((a, b) => b.t - a.t);
  return candidates[0]?.version ?? null;
}

export function readWorkspace(fs, path) {
  return fs.readFileSync(path, "utf8");
}

export function listExcludes(yaml) {
  const block = yaml.match(
    /^minimumReleaseAgeExclude:\n((?:[ \t]+-[ \t]*.+\n)*)/m,
  );
  if (!block) return [];
  return [...block[1].matchAll(/^[ \t]+-[ \t]*["']?(.+?)["']?[ \t]*$/gm)].map(
    (m) => m[1],
  );
}

export function upsertExcludes(yaml, patterns) {
  const unique = [...new Set([...listExcludes(yaml), ...patterns])].sort();
  const block =
    unique.length === 0
      ? ""
      : `minimumReleaseAgeExclude:\n${unique.map((p) => `  - "${p}"`).join("\n")}\n`;

  if (/^minimumReleaseAgeExclude:/m.test(yaml)) {
    return yaml.replace(
      /^minimumReleaseAgeExclude:\n(?:[ \t]+-[ \t]*.+\n)*/m,
      block,
    );
  }

  // Insert after minimumReleaseAge if present, else after packages block.
  if (/^minimumReleaseAge:/m.test(yaml)) {
    return yaml.replace(/^(minimumReleaseAge:[^\n]*\n)/m, `$1\n${block}`);
  }
  if (/^packages:\n(?:[ \t]+-[ \t]*.+\n)*/m.test(yaml)) {
    return yaml.replace(/^(packages:\n(?:[ \t]+-[ \t]*.+\n)*)/m, `$1\n${block}`);
  }
  return `${yaml.trimEnd()}\n\n${block}`;
}

export function ensureMinimumReleaseAge(yaml, minutes = MINIMUM_RELEASE_AGE_MINUTES) {
  if (/^minimumReleaseAge:/m.test(yaml)) {
    return yaml.replace(
      /^minimumReleaseAge:[^\n]*/m,
      `minimumReleaseAge: ${minutes}`,
    );
  }
  if (/^packages:\n(?:[ \t]+-[ \t]*.+\n)*/m.test(yaml)) {
    return yaml.replace(
      /^(packages:\n(?:[ \t]+-[ \t]*.+\n)*)/m,
      `$1\nminimumReleaseAge: ${minutes}\n`,
    );
  }
  return `minimumReleaseAge: ${minutes}\n\n${yaml}`;
}

export function listOverrides(yaml) {
  const block = yaml.match(/^overrides:\n((?:[ \t]+.+\n)*)/m);
  if (!block) return {};
  /** @type {Record<string, string>} */
  const out = {};
  for (const m of block[1].matchAll(
    /^[ \t]+['"]?([^'":\n]+)['"]?[ \t]*:[ \t]*['"]?([^'"\n#]+?)['"]?[ \t]*(?:#.*)?$/gm,
  )) {
    out[m[1].trim()] = m[2].trim();
  }
  return out;
}

export function upsertOverrides(yaml, additions) {
  const merged = { ...listOverrides(yaml), ...additions };
  const keys = Object.keys(merged).sort();
  const block =
    keys.length === 0
      ? ""
      : `overrides:\n${keys
          .map((k) => {
            const key = /[@/:]/.test(k) ? `'${k}'` : k;
            return `  ${key}: ${merged[k]}`;
          })
          .join("\n")}\n`;

  if (/^overrides:/m.test(yaml)) {
    return yaml.replace(/^overrides:\n(?:[ \t]+.+\n)*/m, block);
  }
  return `${yaml.trimEnd()}\n\n${block}`;
}
