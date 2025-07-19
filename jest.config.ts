export default {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|js|html|svg)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@feature/(.*)$': '<rootDir>/src/app/feature/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  collectCoverage: true,
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'json-summary'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/src/apps/.*/src/main.ts',
    '.*\\.setup\\.ts$',
    '.*\\.routes\\.ts$',
    '.*\\.d\\.ts$',
    '.*\\.config\\.ts$',
    '<rootDir>/src/app/app.routes.ts',
    '<rootDir>/src/app/mocks/',
  ],
};
