/*
 * Webpack distribution configuration
 *
 * This file is set up for serving the distribution version. It will be compiled to dist/ by default
 */

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  // not inlined to reduce bundle size
  devtool: 'source-map',
  stats: {
    colors: true,
    reasons: true,
  },
  optimization: {
    // Terser is a substitution for AgressiveMergingPlugin
    minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin({})],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    // Momentary solution until we do code splitting
    new CopyPlugin([
      { from: 'src/images', to: 'images' },
      { from: 'src/vendor/modernizr.js', to: 'vendor/modernizr.js' },
    ]),
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
