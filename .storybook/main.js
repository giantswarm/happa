const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],

  webpackFinal: async (config, { _ }) => {
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      'node_modules',
      path.resolve(`${__dirname}/../src`),
      path.resolve(`${__dirname}/../src/components`),
    ];

    return config;
  },
};
