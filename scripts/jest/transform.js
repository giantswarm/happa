const { transformSync } = require('@swc/core');
const { createHash } = require('crypto');

const transformCache = new Map();

module.exports = {
  process(src, path) {
    const cacheHash = createHash('sha1').update(src).digest('hex');
    const cacheKey = `${path}-${cacheHash}`;

    if (transformCache.has(cacheKey)) {
      return transformCache.get(cacheKey);
    }

    const output = transformSync(src, {
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

    transformCache.set(cacheKey, output);

    return output;
  },
};
