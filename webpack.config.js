const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // mode: 'development',
  entry: './src/components/app.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        enforce: 'pre',
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.sass$/,
        loader: 'style-loader!css-loader!sass-loader?outputStyle=expanded',
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
      {
        test: /\.(png|jpg|svg)$/,
        loader: 'url-loader?limit=8192',
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff',
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream',
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml',
      },
      {
        parser: {
          amd: false, // required so giantswarm-v4 sub-modules can be found
        },
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
  ],
  devServer: {
    contentBase: './src',
    hotOnly: true,
    port: 7000,
    host: '0.0.0.0',
    historyApiFallback: true,
  },
};
