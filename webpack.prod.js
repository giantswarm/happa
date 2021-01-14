/* eslint-disable @typescript-eslint/no-var-requires */
/*
 * Webpack distribution configuration
 *
 * This file is set up for serving the distribution version. It will be compiled to dist/ by default
 */

const merge = require('webpack-merge').merge;
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  stats: {
    colors: true,
    reasons: true,
  },
  optimization: {
    // Terser is a substitution for AgressiveMergingPlugin
    minimizer: [
      new TerserPlugin({
        extractComments: 'some',
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'assets/[name].[chunkhash:12].css',
      chunkFilename: 'assets/[id].[chunkhash:12].css',
    }),
    // Momentary solution until we do code splitting
    new CopyPlugin({
      patterns: [
        { from: 'src/metadata.json', to: 'metadata.json' },
        { from: 'src/images', to: 'images' },
        { from: 'src/vendor/modernizr.js', to: 'vendor/modernizr.js' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
});
