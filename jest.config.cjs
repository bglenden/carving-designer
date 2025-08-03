/** @type {import('ts-jest').JestConfigWithTsJest} */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jest-environment-jsdom',
  // This is the key change: use the utility from ts-jest to map paths from tsconfig.
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
  moduleNameMapper: {
    // Strip .js extension in relative imports for ESM
    '^(\\.{1,2}/.*)\\.js$': '$1',

    // This rule is for the @/ path alias, and it strips the .js extension.
    '^@/(.*).js$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Match test files in the tests directory
  testMatch: ['**/tests/**/*.test.ts'],
  // Don't transform node_modules except for packages that are ESM-only
  transformIgnorePatterns: ['node_modules/(?!(some-esm-only-package)/)'],
  // Add setup file if needed, for example to configure jsdom
  setupFilesAfterEnv: ['./tests/setupTests.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/core/types.ts', '!src/**/*.d.ts'],
  coveragePathIgnorePatterns: ['node_modules', 'tests', 'dist'],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};
