const { transformSync } = require('@swc/core');

module.exports = {
  process(src, path) {
    return transformSync(src, {
      filename: path,
      jsc: {
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
          react: {
            runtime: 'automatic',
            development: true,
          },
          hidden: {
            jest: true,
          },
        },
        target: 'es2015',
        parser: {
          syntax: 'typescript',
          tsx: true,
          decorators: true,
          dynamicImport: true,
        },
      },
      module: {
        type: 'commonjs',
      },
      sourceFileName: path,
    });
  },
};
