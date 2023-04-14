import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import remarkGfm from 'remark-gfm';
import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-webpack5',
    options: {
      fastRefresh: true,
      builder: {
        fsCache: true,
        lazyCompilation: true,
      },
    },
  },
  features: {
    storyStoreV7: false,
    legacyDecoratorFileOrder: true,
  },
  docs: {
    autodocs: true,
  },
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
        babelOptions: {},
        sourceLoaderOptions: null,
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
  },
  webpackFinal: async (config) => {
    config.resolve!.modules = [
      ...(config.resolve!.modules || []),
      'node_modules',
      path.resolve(`${__dirname}/../src`),
      path.resolve(`${__dirname}/../src/components`),
    ];
    config.module!.rules!.push({
      test: /\.sass$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
    });
    config.plugins!.push(
      new MiniCssExtractPlugin({
        filename: '[name]-[contenthash].css',
        chunkFilename: '[id]-[contenthash].css',
      })
    );
    return config;
  },
};

export default config;
