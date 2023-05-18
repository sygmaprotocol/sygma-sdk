module.exports = {
  extends: '../../.eslintrc.cjs',
  project: './tsconfig.json',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
};
