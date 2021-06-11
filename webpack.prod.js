/* eslint-disable @typescript-eslint/no-var-requires */
/*
 * Webpack distribution configuration
 *
 * This file is set up for serving the distribution version. It will be compiled to dist/ by default
 */

const webpack = require('webpack');
const merge = require('webpack-merge').merge;
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const SentryCliPlugin = require('@sentry/webpack-plugin');
const envFileVars = require('dotenv').config().parsed;

const { SENTRY_UPLOAD_SOURCEMAPS, SENTRY_API_KEY, SENTRY_RELEASE_VERSION } =
  Object.assign(
    {
      SENTRY_UPLOAD_SOURCEMAPS: 'false',
      SENTRY_API_KEY: '',
      SENTRY_RELEASE_VERSION: 'happa@development',
    },
    envFileVars,
    process.env
  );

const plugins = [
  new webpack.SourceMapDevToolPlugin({
    filename: '[file].map[query]',
    append: '//# sourceMappingURL=[url]',
  }),
  new MiniCssExtractPlugin({
    filename: 'assets/[name].[chunkhash:12].css',
    chunkFilename: 'assets/[id].[chunkhash:12].css',
  }),
  // Momentary solution until we do code splitting
  new CopyPlugin({
    patterns: [
      { from: 'src/metadata.json', to: 'metadata.json' },
      {
        from: 'src/images',
        globOptions: {
          ignore: ['**/*.sketch'],
        },
        to: 'images',
      },
    ],
  }),
];

if (SENTRY_UPLOAD_SOURCEMAPS.toLowerCase() === 'true') {
  plugins.push(
    new SentryCliPlugin({
      include: './dist/assets',
      authToken: SENTRY_API_KEY,
      ignore: ['./dist/assets/images/index.js', '**/*.css.map'],
      org: 'giantswarm',
      project: 'happa',
      release: SENTRY_RELEASE_VERSION,
      validate: true,
    })
  );
}

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  stats: {
    colors: true,
    reasons: true,
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: 'some',
      }),
      new CssMinimizerPlugin(),
    ],
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  plugins,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(scss|sass)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
});
