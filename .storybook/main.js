const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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

    config.module.rules.push({
      test: /\.sass$/,
      loaders: [
        'style-loader',
        'css-loader',
        'sass-loader', // if scss then add 'sass-loader'
      ],
    });

    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: '[name]-[contenthash].css',
        chunkFilename: '[id]-[contenthash].css',
      })
    );

    return config;
  },
};
