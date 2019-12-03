var localStorageMock = (function() {
  var store = {};

  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value;
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    },

    // replaceWith is not part of the localStorage spec, but useful for us
    // in testing to set the full localStorage to a known set of values.
    replaceWith: function(newStore) {
      store = newStore;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Adjust the console logging behaviour during test runs.
global.console = {
  log: console.log,
  error: jest.fn(),
  warn: jest.fn(), // warnings are surpressed.
  info: console.info,
  debug: console.debug,
};
