const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  core: {
    builder: 'webpack5',
  },
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
        babelOptions: {},
        sourceLoaderOptions: null,
      },
    },
    '@storybook/addon-links',
    '@storybook/addon-essentials',
  ],

  webpackFinal: async (config, { _ }) => {
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      'node_modules',
      path.resolve(`${__dirname}/../src`),
      path.resolve(`${__dirname}/../src/components`),
    ];

    config.module.rules.push({
      test: /\.sass$/,
      loaders: ['style-loader', 'css-loader', 'sass-loader'],
    });

    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        { loader: require.resolve('babel-loader') },
        { loader: require.resolve('react-docgen-typescript-loader') },
      ],
    });
    config.resolve.extensions.push('.ts', '.tsx');

    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: '[name]-[contenthash].css',
        chunkFilename: '[id]-[contenthash].css',
      })
    );

    return config;
  },
};
