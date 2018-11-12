/*
 * Webpack development server configuration
 *
 * This file is set up for serving the webpack-dev-server, which will watch for changes and recompile as required if
 * the subfolder /webpack-dev-server/ is visited. Visiting the root will not automatically reload.
 */
'use strict';
var webpack = require('webpack');
var path = require('path');

module.exports = {

  entry: './src/components/app.js',
  mode: 'development',

  output: {
    filename: 'app.js',
    publicPath: '/assets/'
  },

  cache: true,

  devtool: false,

  stats: {
    colors: true,
    reasons: true
  },

  resolve: {
    extensions: ['.js'],
    alias: {
      'styles': __dirname + '/src/styles',
      'mixins': __dirname + '/src/mixins',
      'components': __dirname + '/src/components/',
      'stores': __dirname + '/src/stores/',
      'actions': __dirname + '/src/actions/'
    }
  },

  module: {

    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: ['transform-react-jsx', 'transform-class-properties']
          }
        }
      },
      {
        test: /\.sass$/,
        loader: 'style-loader!css-loader!sass-loader?outputStyle=expanded'
      }, {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }, {
        test: /\.(png|jpg|svg)$/,
        loader: 'url-loader?limit=8192'
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
      },
      {
        parser: {
          amd: false // required so giantswarm-v4 sub-modules can be found
        }
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin({debug: true}),
    new webpack.NoEmitOnErrorsPlugin({debug: true})
  ]

};
