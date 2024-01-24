const { antfu } = require('@antfu/eslint-config')

module.exports = antfu({
  stylistic: true, // enable stylistic formatting rules
  typescript: true,
  yml: false,
  vue: false,
  rules: {
    'node/prefer-global/process': 'off',
    'antfu/consistent-list-newline': 'off',
    'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'ts/consistent-type-definitions': ['error', 'type'],
    'curly': ['error', 'all'],
    // 'node/prefer-global/process': 'off',
    'no-console': 'off',
  },
})
