class LocalStorage {
  /**
   * @private
   */
  static _instance = null;

  /**
   * @returns {LocalStorage}
   */
  static getInstance() {
    if (!LocalStorage._instance) {
      LocalStorage._instance = new LocalStorage(window.localStorage);
    }

    return LocalStorage._instance;
  }

  storage = null;

  constructor(storage) {
    this.storage = storage;
  }

  getValue(key) {
    return this.storage.getItem(key);
  }

  setValue(key, value) {
    return this.storage.setItem(key, value);
  }
}

export default LocalStorage;
