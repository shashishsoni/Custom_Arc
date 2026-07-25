/** Shared string/URL helpers — safe for API and web. */

/** Base URLs are joined with paths that already start with `/`. */
export function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}
