import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/storybook-static/**', '**/node_modules/**', '**/.storybook/public/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  ...storybook.configs['flat/recommended'],
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Consumers on Next 15 get React from Next's bundled canary, which exports useEffectEvent only as
      // experimental_useEffectEvent: importing it breaks their `next build`. Keep to APIs every React 19 peer has.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['useEffectEvent'],
              message: 'Not in the React canary bundled with Next 15; use a ref.',
            },
          ],
        },
      ],
    },
  },
);
