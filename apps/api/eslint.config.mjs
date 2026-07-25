// ESLint flat config for the API (Bun + Elysia). tsc handles types via `typecheck`;
// this catches the practice bugs tsc misses (unused vars, sloppy equality, etc.).
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      eqeqeq: ['error', 'smart'],
      'prefer-const': ['error', { destructuring: 'all' }],
    },
  },
)
