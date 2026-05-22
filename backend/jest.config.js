const baseConfig = {
  displayName: 'sho-team-be',
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

const ciProjectAliases = [
  'sho-team-be',
  'api',
  'location-service',
  'api-gateway',
  'servease-api-gateway',
  'auth-service',
  'servease-auth-service',
  'user-service',
  'servease-user-service',
  'catalog-service',
  'servease-catalog-service',
  'booking-service',
  'servease-booking-service',
  'availability-service',
  'servease-availability-service',
  'messaging-service',
  'servease-messaging-service',
  'payment-service',
  'servease-payment-service',
  'review-service',
  'servease-review-service',
  'notification-service',
  'servease-notification-service',
  'support-service',
  'servease-support-service',
  'admin-service',
  'servease-admin-service',
];

const isSelectingProjects = process.argv.some(
  (arg) => arg === '--selectProjects' || arg.startsWith('--selectProjects='),
);

const rootConfig = { ...baseConfig };
delete rootConfig.displayName;

module.exports = isSelectingProjects
  ? {
      ...rootConfig,
      projects: ciProjectAliases.map((displayName) => ({
        ...baseConfig,
        displayName,
      })),
    }
  : baseConfig;
