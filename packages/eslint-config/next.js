const base = require('./base');
const reactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...base,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
