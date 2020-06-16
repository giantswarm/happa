/* eslint-disable @typescript-eslint/no-var-requires, no-magic-numbers, no-console */

/*
 * Webpack development server configuration
 *
 * This file is set up for serving the webpack-dev-server, which will watch for changes and recompile as required if
 * the subfolder /webpack-dev-server/ is visited. Visiting the root will not automatically reload.
 *
 * It also starts helpful CORS proxies if HAPPA_API_PROXY  and or HAPPA_PASSAGE_PROXY environment variables are set:
 *
 * HAPPA_API_PROXY=https://api.g8s.example.io  HAPPA_PASSAGE_PROXY=https://passage.g8s.example.io yarn start
 */

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const ProxyPlugin = require('./scripts/proxyPlugin');

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
    new ProxyPlugin('API', 'HAPPA_API_PROXY', 8000),
    new ProxyPlugin('PASSAGE', 'HAPPA_PASSAGE_PROXY', 5001),
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
