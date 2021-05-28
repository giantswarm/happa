// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('isomorphic-fetch');

const localStorageMock = (function () {
  let store = {};

  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value;
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },

    // replaceWith is not part of the localStorage spec, but useful for us
    // in testing to set the full localStorage to a known set of values.
    replaceWith: function (newStore) {
      store = newStore;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Adjust the console logging behaviour during test runs.
/* eslint-disable no-console */
global.console = {
  log: console.log,
  error: console.error,
  warn: jest.fn(), // warnings are surpressed.
  info: console.info,
  debug: console.debug,
};
/* eslint-enable no-console */

global.fetch = fetch;
