module.exports = {
  env: {
    browser: true,
    node: true,
  },
  rules: {
    semi: ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'comma-dangle': ['error', 'always-multiline'],
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
    indent: ['error', 2, { MemberExpression: 1 }],
    'object-curly-spacing': ['error', 'always'],
    'space-in-parens': ['error', 'always'],
    'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
  },
};
