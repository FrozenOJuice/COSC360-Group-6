module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/../tests/backend'],
  testMatch: ['**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  modulePaths: ['<rootDir>/node_modules'],
  setupFiles: ['<rootDir>/../tests/backend/setup.js'],
  clearMocks: true,
};
