/**
 * A singleton wrapper around the browser's local storage,
 * to provide greater extendability, as well as
 * mocking during testing
 */
class LocalStorage {
  /**
   * The singleton current instance
   * @type {?LocalStorage}
   * @private
   */
  static _instance = null;

  /**
   * Get the current singleton instance, or create one if it doesn't exist
   * It will automatically get the window's `localStorage` property bound to it
   * @return {LocalStorage}
   */
  static getInstance() {
    if (!LocalStorage._instance) {
      LocalStorage._instance = new LocalStorage(window.localStorage);
    }

    return LocalStorage._instance;
  }

  /**
   * The current storage container
   * @type {?typeof window.localStorage}
   */
  storage = null;

  /**
   * Create a new persistent storage container
   * @param {typeof window.localStorage} storage - The internal storage method (can be a mock of the window's `localStorage` property)
   */
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Get a value stored in the container
   * @param {any | null} key - The key used for storing the value (will be `null` if not found)
   */
  getValue(key) {
    return this.storage.getItem(key);
  }

  /**
   * Store a value in the container
   * @param {string} key - A name used to reference the value
   * @param {any} value - The value stored
   */
  setValue(key, value) {
    return this.storage.setItem(key, value);
  }
}

export default LocalStorage;
