/*
 * Webpack development server configuration
 *
 * This file is set up for serving the webpack-dev-server, which will watch for changes and recompile as required if
 * the subfolder /webpack-dev-server/ is visited. Visiting the root will not automatically reload.
 */

/* eslint-disable */
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const dotenv = require('dotenv');
const apiProxy = require('./scripts/api-proxy.js');
/* eslint-enable */

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    filename: 'assets/[name].[hash].js',
  },
  devServer: {
    contentBase: './src',
    hotOnly: true,
    port: 7000,
    host: 'localhost',
    historyApiFallback: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    {
      apply: (compiler) => {
        compiler.hooks.afterEnvironment.tap(
          'Start proxy if HAPPA_AUDIENCE is defined',
          () => {
            // eslint-disable-next-line
            console.log('[API Proxy Plugin] Checking for HAPPA_AUDIENCE');

            const envFileVars = dotenv.config().parsed;
            const { HAPPA_AUDIENCE } = Object.assign(
              {},
              envFileVars,
              process.env
            );

            if (!HAPPA_AUDIENCE) {
              // eslint-disable-next-line
              console.log(
                '[API Proxy Plugin] Skipping. HAPPA_AUDIENCE not defined. '
              );

              return;
            }

            // eslint-disable-next-line
            console.log(
              '[API Proxy Plugin] Starting CORS proxy on localhost:8000 to:',
              HAPPA_AUDIENCE
            );

            // eslint-disable-next-line
            apiProxy.startProxy(8000, HAPPA_AUDIENCE, '', false, '*');

            // eslint-disable-next-line
            console.log('[API Proxy Plugin] Succesfully started CORS proxy');
          }
        );
      },
    },
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
    ],
  },
});
