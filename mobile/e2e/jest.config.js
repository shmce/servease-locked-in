module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.e2e.js'],
  testTimeout: 120000,
  testEnvironment: 'node',
  reporters: ['detox/runners/jest/reporter'],
  verbose: true,
};
