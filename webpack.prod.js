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
  devtool: 'source-map',
  stats: {
    colors: true,
    reasons: true,
  },
  optimization: {
    minimize: true,
    // Terser is a substitution for AgressiveMergingPlugin
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it
            // to apply any minification steps that turns valid ecma 5 code
            // into invalid ecma 5 code.
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            ascii_only: true,
          },
        },
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
    splitChunks: {
      chunks: 'all',
      name: false,
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'assets/[name].[chunkhash:12].css',
      chunkFilename: 'assets/[id].[chunkhash:12].css',
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
