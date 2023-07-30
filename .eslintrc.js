module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parser: 'babel-eslint',
  extends: ['plugin:prettier/recommended'],
  rules: {
    'no-undef': 'error',
    'no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true /* 解构剩余变量时不检查 */,
      },
    ],
    'prettier/prettier': 'warn',
  },
}
