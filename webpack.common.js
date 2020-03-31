// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require('webpack');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const HtmlWebpackPlugin = require('html-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: ['react-hot-loader/patch', './src/components/index.tsx'],
  context: __dirname,
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
    }),
    // Ignore locale data from the moment package, which we don't use.
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
};
