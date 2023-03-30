module.exports = {
  extends: '../../.eslintrc.cjs',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
};
