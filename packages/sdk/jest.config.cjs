module.exports = {
  roots: ['<rootDir>/integration/test', '<rootDir>/src'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  verbose: true,
  preset: 'ts-jest/presets/default-esm',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'jsdom',
  testTimeout: 15000,
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true }],
  },
  testPathIgnorePatterns: ['./dist', '<rootDir>/integration/'],
};
