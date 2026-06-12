export default {
  preset:        "ts-jest",
  testEnvironment: "node",
  roots:         ["<rootDir>/src"],
  testMatch:     ["**/__tests__/**/*.test.ts"],
  // Strip .js extensions from imports so ts-jest resolves .ts source files
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/db/**",          // skip migrations/schema
    "!src/index.ts",       // skip server entry point
  ],
  coverageThreshold: {
    global: { lines: 60 },
  },
};