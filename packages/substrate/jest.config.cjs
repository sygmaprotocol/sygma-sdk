module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/test'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  verbose: true,
  preset: 'ts-jest',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  moduleFileExtensions: ['ts', 'js'],
  testEnvironment: 'node',
  testTimeout: 15000,
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true }],
  },

  testPathIgnorePatterns: ['./dist-cjs/', './dist-esm/'],
  automock: false,
  setupFiles: [
    './test/setupJest.js',
  ],
  testMatch: ['**/test/**/*.test.ts', '**/__test__/*.test.ts'],
};
