// Staged-file checks for the web app. Errors (unused vars, rules-of-hooks) block
// the commit; warnings (exhaustive-deps, no-explicit-any) are printed but don't.
export default {
  '*.{ts,tsx,mjs}': ['eslint --fix', 'prettier --write'],
  '*.{css,json,md}': 'prettier --write',
}
