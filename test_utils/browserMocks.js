var localStorageMock = (function() {
  var store = {};

  return {
    getItem: function(key) {
      console.log('getItem', key, store);
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value;
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      console.log('clear');
      store = {};
    },

    // replaceWith is not part of the localStorage spec, but useful for us
    // in testing to set the full localStorage to a known set of values.
    replaceWith: function(newStore) {
      console.log('replaceWith', store, newStore);
      store = newStore;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Adjust the console logging behaviour during test runs.
global.console = {
  log: console.log,
  error: console.error,
  // warn: jest.fn(), // warnings are surpressed.
  warn: console.warn, // warnings are not surpressed.
  info: console.info,
  debug: console.debug,
};