const JSDOMEnvironment = require('jest-environment-jsdom').default;

// nock v14 (via @mswjs/interceptors) intercepts the native `fetch` API and needs
// spec-complete `Request`/`Response`/`Headers` implementations. jsdom ships partial
// versions (e.g. `new Request(...).signal` is `null`, which crashes nock's response
// handling). Copy Node's native implementations into the jsdom global so the app's
// fetch-based clients are intercepted correctly during tests.
class CustomJSDOMEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);

    for (const name of [
      'fetch',
      'Request',
      'Response',
      'Headers',
      'FormData',
      'AbortController',
      'AbortSignal',
      'ReadableStream',
      'WritableStream',
      'TransformStream',
      'BroadcastChannel',
      'structuredClone',
    ]) {
      if (typeof globalThis[name] !== 'undefined') {
        this.global[name] = globalThis[name];
      }
    }
  }
}

module.exports = CustomJSDOMEnvironment;
