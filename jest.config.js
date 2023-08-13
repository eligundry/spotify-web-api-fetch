/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  setupFiles: ['./setupJest.js'],
}
