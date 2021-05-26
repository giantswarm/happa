/* eslint-disable @typescript-eslint/no-var-requires, no-magic-numbers, no-console */

/*
 * Webpack development server configuration
 *
 * This file is set up for serving the webpack-dev-server, which will watch for changes and recompile as required if
 * the subfolder /webpack-dev-server/ is visited. Visiting the root will not automatically reload.
 *
 * It also starts helpful CORS proxies if HAPPA_PROXY_INSTALLATION or HAPPA_PROXY_BASE_DOMAIN environment variables are set:
 *
 * HAPPA_PROXY_INSTALLATION=ginger yarn start
 */

const merge = require('webpack-merge').merge;
const common = require('./webpack.common.js');
const webpack = require('webpack');
const ProxyPlugin = require('./scripts/webpack/proxyPlugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  output: {
    filename: 'assets/[name].[contenthash].js',
  },
  devServer: {
    contentBase: './src',
    hotOnly: true,
    port: 7000,
    host: 'localhost',
    historyApiFallback: {
      index: '/',
      disableDotRule: true,
    },
    // used for app catalogs proxy /catalogs?url=
    proxy: {
      '/catalogs': {
        target: 'https://cors-anywhere.herokuapp.com/',
        changeOrigin: true,
        onProxyReq: (proxyReq) => {
          const wantedUrl = proxyReq.path.substr(
            proxyReq.path.indexOf('?url=') + 5
          );
          proxyReq.path = `/${wantedUrl}`;
          proxyReq.setHeader('origin', 'http://localhost:7000');
        },
      },
    },
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ProxyPlugin([
      {
        service: 'api',
        localPort: 8000,
      },
      {
        service: 'happaapi',
        localPort: 8888,
      },
      {
        service: 'passage',
        localPort: 5001,
      },
      {
        service: 'oidc_issuer',
        localPort: 9999,
      },
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
});
