// Staged-file checks for the API. eslint blocks on errors; tsc runs at pre-push.
export default {
  '*.{ts,tsx,mjs}': ['eslint --fix', 'prettier --write'],
  '*.{json,md}': 'prettier --write',
}
