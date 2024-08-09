module.exports = {
    roots: ['<rootDir>/src', '<rootDir>/test'],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    verbose: true,
    preset: 'ts-jest/presets/default-esm',
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    testEnvironment: 'node',
    testTimeout: 15000,
    transform: {
      '^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true }],
    },
    testPathIgnorePatterns: ['./dist'],
    automock: false,
    setupFiles: [
      "<rootDir>/test/setupJest.js"
    ]
  };
