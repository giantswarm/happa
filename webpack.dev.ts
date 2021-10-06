/* eslint-disable no-magic-numbers, no-console */

/**
 * Webpack development server configuration
 *
 * This file is set up for serving the webpack-dev-server, which will watch for changes and recompile as required if
 * the subfolder /webpack-dev-server/ is visited. Visiting the root will not automatically reload.
 * */

import 'webpack-dev-server';

import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';

import { ConfigurationPlugin } from './scripts/webpack/ConfigurationPlugin';
import common, { compilerConfig } from './webpack.common';

const config: webpack.Configuration = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  cache: true,
  stats: {
    colors: true,
    reasons: true,
    logging: 'info',
  },
  infrastructureLogging: {
    level: 'log',
  },
  output: {
    filename: 'assets/[name].js',
  },
  // @ts-expect-error
  devServer: {
    static: path.join(__dirname, 'src'),
    hot: true,
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
    new ConfigurationPlugin({
      filename: 'index.ejs',
      outputFilename: 'index.html',
      overrides: {
        apiEndpoint: 'http://localhost:8000',
        mapiEndpoint: 'http://localhost:8888',
        athenaEndpoint: 'http://localhost:7777',
        mapiAudience: 'http://localhost:9999',
        passageEndpoint: 'http://localhost:5001',
        mapiAuthRedirectURL: 'http://localhost:7000',
        environment: 'development',
        happaVersion: 'development',
        enableRealUserMonitoring: false,
      },
      proxies: [
        {
          port: 8000,
          host: (options) => options.apiEndpoint,
        },
        {
          port: 8888,
          host: (options) => options.mapiEndpoint,
        },
        {
          port: 7777,
          host: (options) => options.athenaEndpoint,
        },
        {
          port: 5001,
          host: (options) => options.passageEndpoint,
        },
        {
          port: 9999,
          host: (options) => {
            if (!/http(s)?:\/\//.test(options.mapiAudience)) {
              return `https://${options.mapiAudience}`;
            }

            return options.mapiAudience;
          },
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|ts)(x?)$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve('swc-loader'),
          options: compilerConfig,
        },
      },
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
