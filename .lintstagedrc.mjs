// Root fallback — files outside apps/web and apps/api (packages/*, docs, configs).
// Each app has its own .lintstagedrc.mjs; lint-staged picks the closest one per file.
export default {
  '*': 'prettier --write --ignore-unknown',
}
