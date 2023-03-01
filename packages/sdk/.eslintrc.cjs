module.exports = {
  extends: '../../.eslintrc.cjs',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    // project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['*.test.ts', '**/__test__/*.ts'],
};
