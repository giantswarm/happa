/*
 * Webpack distribution configuration
 *
 * This file is set up for serving the distribution version. It will be compiled to dist/ by default
 */

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  stats: {
    colors: true,
    reasons: true,
  },
  optimization: {
    minimizer: [new TerserPlugin()],
  },

  plugins: [
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),

    // Ignore locale data from the moment package, which we don't use.
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
});
