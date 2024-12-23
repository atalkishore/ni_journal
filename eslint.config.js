import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    ignores: ['public/**/*.js'], // Apply these settings to all JS files
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': [
        'error',
        prettierConfig, // Integrate Prettier configuration here
      ], // Enforce Prettier formatting
      'import/no-unresolved': 'error', // Disallow unresolved imports
      'import/named': 'error', // Ensure named imports match the exported names
      'import/default': 'error', // Enforce default imports when expected
      'import/export': 'error', // Validate export statements
      'import/extensions': [
        'error',
        'always',
        {
          js: 'always', // Require `.js` extension for JavaScript files
          jsx: 'never', // Avoid `.jsx` extension
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external'], // Built-in and external modules
            ['internal', 'parent', 'sibling', 'index'], // Internal imports, relative paths
          ],
          'newlines-between': 'always', // Add newlines between groups
          alphabetize: {
            order: 'asc',
            caseInsensitive: true, // Ignore case in alphabetical order
          },
        },
      ],
      'no-console': 'warn', // Warn on `console` usage
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^ignored' },
      ], // Ignore unused variables matching patterns
      eqeqeq: 'error', // Enforce strict equality
      curly: 'error', // Enforce curly braces for all control statements
      'arrow-body-style': ['error', 'as-needed'], // Enforce concise arrow functions
      'prefer-const': 'error', // Prefer `const` over `let` when possible
      'no-var': 'error', // Disallow `var` in favor of `let` or `const`
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.mjs', '.json'], // Allow imports with these extensions
        },
      },
    },
  },
];
