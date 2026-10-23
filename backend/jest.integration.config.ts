import type { Config } from 'jest';

// Tests sur une vraie base PostgreSQL (moodmap_test), recréée à chaque lancement.
const config: Config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__/integration'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\.ts$': 'ts-jest',
  },
  globalSetup: '<rootDir>/__tests__/integration/helpers/global-setup.ts',
  setupFiles: ['<rootDir>/__tests__/integration/helpers/env.setup.ts'],
  testTimeout: 30_000,
};

export default config;
