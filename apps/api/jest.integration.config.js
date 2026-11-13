module.exports = {
  rootDir: "../..",
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/apps/api/src/integration/**/*.integration.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
