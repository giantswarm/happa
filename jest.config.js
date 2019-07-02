module.exports = {
  testEnvironment: 'jest-environment-jsdom', // or jest-environment-node
  setupFilesAfterEnv: ['@testing-library/react/cleanup-after-each'],
};
