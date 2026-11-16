module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
testMatch: [
  "<rootDir>/src/**/*.test.ts",
  "<rootDir>/apps/api/src/**/*.test.ts",
],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "<rootDir>/apps/api/src/integration/",
  ],
};