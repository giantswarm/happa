/**
 * An easy to use manager for in-app routes
 */
class RoutePath {
  /**
   * Generate route path with parameters
   * @param {String} template
   * @param {Record<String, String|Number>} parameters
   * @returns {RoutePath}
   */
  static create(template, parameters = {}) {
    const newRoute = new RoutePath(template);
    newRoute.params = parameters;

    return newRoute;
  }

  /**
   * Generate a usable string path with parameters
   * @param {String} template
   * @param {Record<String, String|Number>} parameters
   * @returns {String}
   */
  static createUsablePath(template, parameters) {
    return RoutePath.create(template, parameters).value;
  }

  /**
   * Get a parameter map based on a known path
   * @param {String} template
   * @returns {Record<String, String|Number>}
   */
  static getParametersFromPath(template) {
    let currentParamName = '';
    let currentMatch = null;

    /**
     * Allows a name that starts with `/:',
     * and which can contain uppercase/lowercase
     * letters, `-`, and `_`
     */
    const validationRegex = /\/:([a-zA-Z_\-]*)(\/)?/g;
    const params = {};

    do {
      currentMatch = validationRegex.exec(template);

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
    const paramNameRegex = new RegExp(`:${paramName}`, 'g');
    const newPath = inPath.replace(paramNameRegex, paramValue);

    return newPath;
  }

  /**
   * Convert a known path to an editable path,
   * by providing the template that it implements
   *
   * Useful for finding parameter values inside
   * stringified paths
   * @param {String} pathTemplate
   * @param {String} path
   * @returns {RoutePath}
   */
  static parseWithTemplate(pathTemplate, path) {
    /**
     * Allows a name that starts with `:',
     * and which can contain uppercase/lowercase
     * letters, `-`, and `_`
     */
    const paramValidationRegex = /:([a-zA-Z_\-]*)(\/)?/g;

    const templateParts = pathTemplate.split('/');
    const pathParts = path.split('/');

    const params = {};

    for (let i = 0; i < templateParts.length; i++) {
      const currentTemplatePart = templateParts[i];
      const currentMatch = paramValidationRegex.exec(currentTemplatePart);

      if (currentMatch === null) continue;

      const currentParamName = currentMatch[1];
      let valueInPath = pathParts[i];

      if (typeof valueInPath !== 'undefined') {
        const valueAsNumber = Number(valueInPath);

        if (!isNaN(valueAsNumber)) {
          valueInPath = valueAsNumber;
        }

        params[currentParamName] = valueInPath;
      }
    }

    return RoutePath.create(pathTemplate, params);
  }

  /**
   * Original path template used on instantiation
   * @private
   * @type {String}
   */
  _originalTemplate = '';

  /**
   * Original params derived from
   * the template used on instantiation
   * @private
   * @type {Record<String, String|Number>}
   */
  _originalParams = {};

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
    let newValue = this.originalTemplate;
    let previousValue = this.originalTemplate;

    const desiredParams = Object.assign(
      {},
      this._originalParams,
      parametersMap
    );

    for (const [paramName, paramValue] of Object.entries(desiredParams)) {
      newValue = RoutePath.replaceParamValue(newValue, paramName, paramValue);

      if (newValue !== previousValue) {
        this._params[paramName] = paramValue;
      }

      previousValue = newValue;
    }

    this._value = newValue;
  }

  /**
   * Get the original path used for instantiating the route
   * @returns {String}
   */
  get originalTemplate() {
    return this._originalTemplate;
  }

  // eslint-disable-next-line class-methods-use-this
  set originalTemplate(_newPath) {
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
    this._originalTemplate = path;
    this._originalParams = RoutePath.getParametersFromPath(
      this._originalTemplate
    );

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
  clone(withParameters = {}) {
    const newRoute = RoutePath.create(this._originalTemplate, withParameters);

    return newRoute;
  }

  /**
   * Reset the parameters of the current route
   * @returns {RoutePath}
   */
  clear() {
    this.params = {};

    return this;
  }
}

export default RoutePath;
