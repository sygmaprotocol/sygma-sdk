module.exports = {
    roots: ["<rootDir>/integration/test", "<rootDir>/src"],

    // Jest transformations -- this adds support for TypeScript
    // using ts-jest
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    // Module file extensions for importing
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    // setupFilesAfterEnv: ["./setupTests.ts"]
    testTimeout: 15000,
}
