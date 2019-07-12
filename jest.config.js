module.exports = {
  testEnvironment: 'jest-environment-jsdom', // or jest-environment-node
  setupFilesAfterEnv: ['@testing-library/react/cleanup-after-each'],
  moduleNameMapper: {
    '\\.css$': require.resolve('./test_utils/assets-mock.js'),
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': require.resolve(
      './test_utils/assets-mock.js'
    ),
  },
  testPathIgnorePatterns: ['/node_modules/', 'node_modules_linux'],
};
