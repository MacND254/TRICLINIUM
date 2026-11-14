module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@triclinium/types$': '<rootDir>/../../packages/types/dist/index.js',
    '^@triclinium/shared$': '<rootDir>/../../packages/shared/dist/index.js',
    '^@triclinium/validation$': '<rootDir>/../../packages/validation/dist/index.js',
  },
};
