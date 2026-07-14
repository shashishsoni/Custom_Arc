// ESLint flat config for the web app (non-interactive replacement for `next lint`).
// Uses typescript-eslint; the Next-specific plugin isn't flat-config ready in 15.5,
// so we rely on tsc + core-web-vitals reasoning here and can add the Next plugin later.
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
)
