/* eslint-disable no-magic-numbers, no-console */

import { Config, ReactConfig } from '@swc/core';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import webpack from 'webpack';

export const compilerConfig: Config = {
  sourceMaps: true,
  jsc: {
    target: 'es2015',
    parser: {
      syntax: 'typescript',
      tsx: true,
      decorators: true,
      dynamicImport: true,
    },
    transform: {
      legacyDecorator: true,
      decoratorMetadata: true,
      react: {
        runtime: 'automatic',
      } as ReactConfig,
    },
    externalHelpers: true,
  },
  env: {
    targets: '> 0.25%, not dead',
  },
};

const config: webpack.Configuration = {
  amd: false,
  entry: ['./src/components/index.tsx'],
  context: __dirname,
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/[name].[chunkhash:12].js',
    chunkFilename: 'assets/[id].[chunkhash:12].js',
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
        },
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/font-woff',
          name: 'assets/[name].[contenthash:12].[ext]',
        },
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/octet-stream',
          name: 'assets/[name].[contenthash:12].[ext]',
        },
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[contenthash:12].[ext]',
        },
      },
      {
        test: /\.md(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[contenthash:12].[ext]',
        },
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          esModule: false,
          mimetype: 'image/svg+xml',
        },
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'raw-loader',
      },
      {
        test: /node_modules\/vfile\/core\.js/,
        use: [
          {
            loader: 'imports-loader',
            options: {
              type: 'commonjs',
              imports: ['single process/browser process'],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
    modules: [
      'node_modules',
      path.resolve(`${__dirname}/src`),
      path.resolve(`${__dirname}/src/components`),
    ],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
    fallback: {
      fs: false,
      path: false,
    },
    symlinks: false,
    cacheWithContext: false,
  },
  plugins: [
    new CleanWebpackPlugin() as unknown as webpack.WebpackPluginInstance,
    new HtmlWebpackPlugin({
      template: 'src/index.ejs',
      filename: 'index.ejs',
    }),
  ],
};

export default config;
