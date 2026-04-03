module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/../tests/frontend'],
  testMatch: ['**/*.test.{js,jsx}'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/../tests/frontend/__mocks__/fileMock.js',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/../tests/frontend/__mocks__/fileMock.js',
  },
  modulePaths: ['<rootDir>/node_modules'],
  setupFilesAfterEnv: ['<rootDir>/../tests/frontend/setup.js'],
  clearMocks: true,
};
