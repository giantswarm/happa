/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const process = require('process');
const dotenv = require('dotenv');
const getServiceURL = require('./scripts/webpack/getServiceURL');
const chalk = require('chalk');

const envFileVars = dotenv.config().parsed;

const determineAudienceURL = () => {
  console.log(
    chalk.blue(
      `🛠  [AudienceURL Helper] Checking for HAPPA_PROXY_INSTALLATION or HAPPA_PROXY_BASE_DOMAIN`
    )
  );

  const { HAPPA_PROXY_INSTALLATION, HAPPA_PROXY_BASE_DOMAIN } = Object.assign(
    {},
    envFileVars,
    process.env
  );

  let apiAudienceUrl = '';
  if (HAPPA_PROXY_INSTALLATION) {
    console.log(
      chalk.blue(
        `🛠  [AudienceURL Helper] HAPPA_PROXY_INSTALLATION is ${HAPPA_PROXY_INSTALLATION}. Setting audience based on opsctl response.`
      )
    );
    apiAudienceUrl = getServiceURL(HAPPA_PROXY_INSTALLATION, 'api');
  } else if (HAPPA_PROXY_BASE_DOMAIN) {
    console.log(
      chalk.blue(
        `🛠  [AudienceURL Helper] HAPPA_PROXY_BASE_DOMAIN is ${HAPPA_PROXY_BASE_DOMAIN}. Setting the audience based on that.`
      )
    );
    apiAudienceUrl = `https://api.${HAPPA_PROXY_BASE_DOMAIN}`;
  }

  console.log(
    chalk.blue(`🛠  [AudienceURL Helper] Set audience to ${apiAudienceUrl}.`)
  );

  return apiAudienceUrl;
};

function makeMapiEndpointURL(currentValue, apiEndpoint) {
  if (!apiEndpoint.includes('localhost')) {
    return apiEndpoint.replace('api', 'happaapi');
  }

  return currentValue;
}

function makeMapiAudienceURL(currentValue, mapiEndpoint) {
  if (!mapiEndpoint.includes('localhost')) {
    return mapiEndpoint.replace('happaapi', 'dex');
  }

  return currentValue;
}

const makeEndpoints = () => {
  const defaults = {
    HAPPA_API_ENDPOINT: 'http://localhost:8000',
    HAPPA_MAPI_ENDPOINT: 'http://localhost:8888',
    HAPPA_PASSAGE_ENDPOINT: 'http://localhost:5001',
  };

  const values = Object.assign({}, defaults, envFileVars, process.env);
  const { HAPPA_API_ENDPOINT, HAPPA_PASSAGE_ENDPOINT } = values;

  let { HAPPA_MAPI_ENDPOINT } = values;
  HAPPA_MAPI_ENDPOINT = makeMapiEndpointURL(
    HAPPA_MAPI_ENDPOINT,
    HAPPA_API_ENDPOINT
  );

  const apiAudienceUrl = determineAudienceURL();
  const mapiAudience = makeMapiAudienceURL(
    'http://localhost:9999',
    HAPPA_MAPI_ENDPOINT
  );

  return {
    apiEndpoint: HAPPA_API_ENDPOINT,
    mapiEndpoint: HAPPA_MAPI_ENDPOINT,
    audience: apiAudienceUrl || HAPPA_API_ENDPOINT,
    mapiAudience,
    passageEndpoint: HAPPA_PASSAGE_ENDPOINT,
  };
};

const makeFeatureFlags = () => {
  const defaults = {
    FEATURE_MAPI_AUTH: false,
    FEATURE_MAPI_CLUSTERS: false,
  };

  const dirtyFlags = Object.assign({}, defaults, envFileVars, process.env);
  const flags = {};
  for (const flagName of Object.keys(defaults)) {
    const flagValue = dirtyFlags[flagName];
    switch (typeof flagValue) {
      case 'string':
        flags[flagName] = flagValue.toLowerCase() === 'true';
        break;

      case 'boolean':
        flags[flagName] = flagValue;
        break;
    }
  }

  return flags;
};

module.exports = {
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
        test: /\.(js|ts)(x?)$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
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
                },
              },
              externalHelpers: true,
            },
            env: {
              targets: '> 0.25%, not dead',
            },
          },
        },
      },
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
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.ejs',
      templateParameters: {
        ...makeEndpoints(),
        ...makeFeatureFlags(),
      },
    }),
  ],
};
