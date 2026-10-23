import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  // Les tests d'intégration ont besoin de PostgreSQL : npm run test:integration.
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/integration/'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/__tests__/__mocks__/env.setup.ts'],
  clearMocks: true,
};

export default config;
