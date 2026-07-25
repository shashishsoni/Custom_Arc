// ESLint flat config for the web app (non-interactive replacement for `next lint`).
// The Next-specific plugin isn't flat-config ready here, so tsc covers what it would;
// react-hooks enforces the Rules of Hooks that tsc cannot.
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  {
    rules: {
      // Hook misuse is a runtime bug, not a style issue — always block.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // New compiler-powered rules in v7: valuable signals, but the existing
      // codebase predates them — warn for now, tighten after cleanup.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // `==` with null is fine (intentional null/undefined check); everything else strict.
      eqeqeq: ['error', 'smart'],
      'prefer-const': ['error', { destructuring: 'all' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Node-run config files (next.config.mjs, postcss, etc.).
    files: ['*.mjs', '*.js'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly' },
    },
  },
)
