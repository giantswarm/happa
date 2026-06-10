/**
 * Custom Jest resolver to support nock v14.
 *
 * nock v14 depends on `@mswjs/interceptors`, and imports its
 * `@mswjs/interceptors/presets/node` entry point. That subpath is mapped to
 * `null` under the `browser` export condition, which `jest-environment-jsdom`
 * applies by default. As a result the default resolver reports the module as
 * missing and every test suite that loads nock (via `test/setupTests.ts`) fails
 * to run.
 *
 * Resolving `@mswjs/interceptors` with the `node` condition added picks the
 * CommonJS Node build instead. The preset itself only uses relative requires
 * internally, so no other subpath needs special handling, and all other modules
 * keep the default (browser) resolution.
 */
module.exports = (request, options) => {
  return options.defaultResolver(request, {
    ...options,
    conditions: request.startsWith('@mswjs/interceptors')
      ? ['node', ...(options.conditions ?? [])]
      : options.conditions,
  });
};
