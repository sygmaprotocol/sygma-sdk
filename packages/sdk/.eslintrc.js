module.exports = {
  extends: "../../.eslintrc.js",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    // project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
}