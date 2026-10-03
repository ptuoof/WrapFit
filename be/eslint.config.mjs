// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

/** Lint for the backend (CI: `npm --workspace=be run lint`). Formatting is Prettier's job, not ESLint's. */
export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { process: 'readonly', require: 'readonly', module: 'readonly', Buffer: 'readonly' } },
    rules: {
      // `_name` marks a parameter or destructured field that is intentionally unused.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
    },
  },
);
