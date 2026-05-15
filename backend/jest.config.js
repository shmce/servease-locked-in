module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.(spec|test)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@servease/common$': '<rootDir>/libs/common/src',
    '^@servease/common/(.*)$': '<rootDir>/libs/common/src/$1',
  },
  collectCoverageFrom: ['apps/**/*.ts', 'libs/**/*.ts', '!**/main.ts'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};
