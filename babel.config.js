module.exports = function (api) {
  const isDevelopment = api.env('development');

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          shippedProposals: true,
          bugfixes: true,
          loose: true,
          corejs: '3.18.3',
        },
      ],
      '@babel/preset-react',
      [
        '@babel/preset-typescript',
        {
          allExtensions: true,
          isTSX: true,
        },
      ],
    ],
    plugins: [
      'transform-class-properties',
      'styled-components',
      'date-fns',
      [
        'transform-imports',
        {
          'react-virtualized': {
            transform: 'react-virtualized/dist/commonjs/${member}/${member}',
            preventFullImport: true,
          },
        },
      ],
      ...[isDevelopment && 'react-refresh/babel'].filter(Boolean),
    ],
  };
};
