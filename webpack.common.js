/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const process = require('process');
const dotenv = require('dotenv');

const envFileVars = dotenv.config().parsed;

const makeEndpoints = () => {
  const defaults = {
    HAPPA_API_ENDPOINT: 'http://localhost:8000',
    HAPPA_PASSAGE_ENDPOINT: 'http://localhost:5001',
  };

  const {
    HAPPA_API_ENDPOINT,
    HAPPA_API_PROXY,
    HAPPA_AUDIENCE,
    HAPPA_PASSAGE_ENDPOINT,
  } = Object.assign({}, defaults, envFileVars, process.env);

  return {
    apiEndpoint: HAPPA_API_ENDPOINT,
    audience: HAPPA_AUDIENCE || HAPPA_API_PROXY || HAPPA_API_ENDPOINT,
    passageEndpoint: HAPPA_PASSAGE_ENDPOINT,
  };
};

const makeFeatureFlags = () => {
  const defaults = {
    FEATURE_CLUSTER_LABELS_V0: true,
    FEATURE_HA_MASTERS: true,
  };

  const dirtyFlags = Object.assign({}, defaults, envFileVars, process.env);

  const flags = Object.create(null);

  for (const flagName of Object.keys(defaults)) {
    const flag = dirtyFlags[flagName];
    switch (typeof flag) {
      case 'string':
        flags[flagName] = flag.toLowerCase() === 'true';
        break;

      case 'boolean':
        flags[flagName] = flag;
        break;
    }
  }

  return flags;
};

module.exports = {
  entry: ['react-hot-loader/patch', './src/components/index.tsx'],
  context: __dirname,
  node: {
    fs: 'empty',
  },
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/[name].[chunkhash:12].js',
  },
  module: {
    rules: [
      {
        test: /\.js(x?)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.sass$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                outputStyle: 'expanded',
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url-loader?limit=8192',
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader:
          'url-loader?limit=10000&mimetype=application/font-woff&name=assets/[name].[contenthash:12].[ext]',
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader:
          'url-loader?limit=10000&mimetype=application/octet-stream&name=assets/[name].[contenthash:12].[ext]',
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader?name=assets/[name].[contenthash:12].[ext]',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml',
        options: {
          esModule: false,
        },
      },
      {
        parser: {
          amd: false, // required so giantswarm-v4 sub-modules can be found
        },
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
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      templateParameters: {
        ...makeEndpoints(),
      },
    }),
    // Ignore locale data from the moment package, which we don't use.
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.DefinePlugin(makeFeatureFlags()),
  ],
};
