/* eslint-disable no-magic-numbers, no-console */

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

import 'webpack-dev-server';

import webpack from 'webpack';
import merge from 'webpack-merge';

import ProxyPlugin from './scripts/webpack/proxyPlugin';
import common from './webpack.common';

const config: webpack.Configuration = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  cache: true,
  output: {
    filename: 'assets/[name].js',
  },
  // @ts-expect-error
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onProxyReq: (proxyReq: Record<string, any>) => {
          const wantedUrl = proxyReq.path.substr(
            (proxyReq.path as string).indexOf('?url=') + 5
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
      {
        test: /\.sass$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
});

export default config;
