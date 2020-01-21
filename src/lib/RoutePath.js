/**
 * An easy to use manager for in-app routes
 */
class RoutePath {
  /**
   * Generate route path with parameters
   * @param {String} path
   * @param {Record<String, String|Number>} parameters
   * @returns {RoutePath}
   */
  static create(path, parameters) {
    const newRoute = new RoutePath(path);
    newRoute.params = parameters;

    return newRoute;
  }

  /**
   * Generate an usable string path with parameters
   * @param {String} path
   * @param {Record<String, String|Number>} parameters
   * @returns {String}
   */
  static createUsablePath(path, parameters) {
    return RoutePath.create(path, parameters).value;
  }

  /**
   * Get a parameter map based on a known path
   * @param {String} path
   * @returns {Record<String, String|Number>}
   */
  static getParametersFromPath(path) {
    let currentParamName = '';
    let currentMatch = null;

    // Allows uppercase/lowercase letters, `-`, and `_`
    const validationRegex = /\/:([a-zA-Z_\-]*)(\/)?/g;
    const params = {};

    do {
      currentMatch = validationRegex.exec(path);

      if (currentMatch === null) break;

      currentParamName = currentMatch[1];

      params[currentParamName] = 0;
    } while (currentMatch);

    return params;
  }

  /**
   * Rplace a known parameter in a path with a value
   * @param {String} inPath Path to use
   * @param {String} paramName
   * @param {String|Number} paramValue
   * @returns {String}
   */
  static replaceParamValue(inPath, paramName, paramValue) {
    let newPath = inPath;

    const paramNameRegex = new RegExp(`:${paramName}`, 'g');
    newPath = newPath.replace(paramNameRegex, paramValue);

    return newPath;
  }

  /**
   * Original path used on instantiation
   * @private
   * @type {String}
   */
  _originalPath = '';

  /**
   * Formatted value
   * @private
   * @type {String}
   */
  _value = '';

  /**
   * Map of current parameters
   * @private
   * @type {Record<String, String|Number>}
   */
  _params = {};

  /**
   * Get the parameters used in the current path
   * @returns {Record<String, String|Number>}
   */
  get params() {
    return this._params;
  }

  /**
   * Set the current path parameters
   * @param parametersMap {Record<String, String|Number>}
   */
  set params(parametersMap) {
    let newValue = this.originalPath;

    this._params = {};

    for (const [paramName, paramValue] of Object.entries(parametersMap)) {
      newValue = RoutePath.replaceParamValue(newValue, paramName, paramValue);

      if (newValue !== this.originalPath) {
        this._params[paramName] = paramValue;
      }
    }

    this._value = newValue;
  }

  /**
   * Get the original path used for instantiating the route
   * @returns {String}
   */
  get originalPath() {
    return this._originalPath;
  }

  // eslint-disable-next-line class-methods-use-this
  set originalPath(_newPath) {
    // No-op
  }

  /**
   * Current formatted value
   * @returns {String}
   */
  get value() {
    return this._value;
  }

  // eslint-disable-next-line class-methods-use-this
  set value(_newValue) {
    // No-op
  }

  /**
   * Create a route path to easily manage your application routing
   * @param {String} path
   */
  constructor(path) {
    this._originalPath = path;
    this.clear();
  }

  /**
   * Set the value of a known path parameter
   * @param {String} newParamName
   * @param {String|Number} newParamValue
   * @returns {RoutePath}
   */
  setParameter(newParamName, newParamValue = 0) {
    this.params = Object.assign({}, this.params, {
      [newParamName]: newParamValue,
    });

    return this;
  }

  /**
   * Create another route with the same path, but with different parameters
   * @param {Record<String, String|Number} withParameters Parameter map
   * @returns {RoutePath}
   */
  clone(withParameters) {
    const newRoute = RoutePath.create(this._originalPath, withParameters);

    return newRoute;
  }

  /**
   * Reset the parameters of the current route
   * @returns {RoutePath}
   */
  clear() {
    this.params = RoutePath.getParametersFromPath(this._originalPath);

    return this;
  }
}

export default RoutePath;
