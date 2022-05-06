module.exports = {
    roots: ["<rootDir>/integration/test"],

    // Jest transformations -- this adds support for TypeScript
    // using ts-jest
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    // Module file extensions for importing
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    // setupFilesAfterEnv: ["./setupTests.ts"]
    testTimeout: 15000,
    modulePathIgnorePatterns: ["<rootDir>/integration/test/chainbridge.e2e.test.ts"]
}
