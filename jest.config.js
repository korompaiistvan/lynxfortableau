// jest.config.js
const nextJest = require('next/jest')
const {defaults} = require('jest-config')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    "\\.twb$": "jest-raw-loader"
  },
  testMatch: [...defaults.testMatch, "!**/__tests__/helper/*.[jt]s?(x)"],
  preset: 'ts-jest/presets/default-esm',
}
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)