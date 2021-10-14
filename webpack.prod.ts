/* eslint-disable no-magic-numbers, no-console */

/*
 * Webpack distribution configuration
 *
 * This file is set up for serving the distribution version. It will be compiled to dist/ by default
 */

import SentryCliPlugin from '@sentry/webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import dotenv from 'dotenv';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import WebpackBundleAnalyzer from 'webpack-bundle-analyzer';
import merge from 'webpack-merge';

import common from './webpack.common';

const envFileVars = dotenv.config().parsed;

const {
  SENTRY_UPLOAD_SOURCEMAPS,
  SENTRY_API_KEY,
  SENTRY_RELEASE_VERSION,
  HAPPA_ANALYZE_BUNDLE,
} = Object.assign(
  {
    SENTRY_UPLOAD_SOURCEMAPS: 'false',
    SENTRY_API_KEY: '',
    SENTRY_RELEASE_VERSION: 'happa@development',
    HAPPA_ANALYZE_BUNDLE: 'false',
  },
  envFileVars,
  process.env
);

const plugins: webpack.WebpackPluginInstance[] = [
  new webpack.SourceMapDevToolPlugin({
    filename: '[file].map[query]',
    append: '//# sourceMappingURL=[url]',
  }),
  new MiniCssExtractPlugin({
    filename: 'assets/[name].[chunkhash:12].css',
    chunkFilename: 'assets/[id].[chunkhash:12].css',
  }) as unknown as webpack.WebpackPluginInstance,
  new CopyPlugin({
    patterns: [
      { from: 'src/metadata.json', to: 'metadata.json' },
      {
        from: 'src/images',
        globOptions: {
          ignore: ['**/*.sketch'],
        },
        to: 'images',
      },
    ],
  }) as unknown as webpack.WebpackPluginInstance,
];

if (SENTRY_UPLOAD_SOURCEMAPS.toLowerCase() === 'true') {
  plugins.push(
    new SentryCliPlugin({
      include: './dist/assets',
      authToken: SENTRY_API_KEY,
      ignore: ['./dist/assets/images/index.js', '**/*.css.map'],
      org: 'giantswarm',
      project: 'happa',
      release: SENTRY_RELEASE_VERSION,
      validate: true,
      urlPrefix: '~/assets/',
    })
  );
}

if (HAPPA_ANALYZE_BUNDLE.toLowerCase() === 'true') {
  plugins.push(new WebpackBundleAnalyzer.BundleAnalyzerPlugin());
}

const config: webpack.Configuration = merge(common, {
  mode: 'production',
  devtool: false,
  stats: {
    colors: true,
    reasons: true,
  },
  optimization: {
    nodeEnv: 'production',
    removeEmptyChunks: true,
    providedExports: true,
    mangleExports: 'deterministic',
    mergeDuplicateChunks: true,
    innerGraph: true,
    concatenateModules: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: 'all',
        terserOptions: {
          sourceMap: true,
          mangle: true,
          compress: true,
        },
      }) as unknown as webpack.WebpackPluginInstance,
      new CssMinimizerPlugin() as unknown as webpack.WebpackPluginInstance,
    ],
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  plugins,
  module: {
    rules: [
      {
        test: /\.(js|ts)(x?)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(scss|sass)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
});

export default config;
