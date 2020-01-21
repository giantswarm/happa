/**
 * A wrapper around the native URL object, which allows for URL creation and editing inside single-page applications
 */
class RouteURL extends URL {
  /**
   * Generate route URL with parameters
   * @param {String} url
   * @param {Record<String, String|Number>} parameters
   * @returns {RouteURL}
   */
  static create(url, parameters) {
    const newRoute = new RouteURL(url);
    newRoute.params = parameters;

    return newRoute;
  }

  /**
   * Get a parameter map based on a known URL
   * @param {String} url
   * @returns {Record<String, String|Number>}
   */
  static getParametersFromURL(url) {
    let currentParamName = '';
    let currentMatch = null;

    // Allows uppercase/lowercase letters, `-`, and `_`
    const validationRegex = /\/:([a-zA-Z_\-]*)(\/)?/g;
    const params = {};

    do {
      currentMatch = validationRegex.exec(url);

      if (currentMatch === null) break;

      currentParamName = currentMatch[1];

      params[currentParamName] = 0;
    } while (currentMatch);

    return params;
  }

  /**
   * Rplace a known parameter in an URL with a value
   * @param {String} inUrl URL to use
   * @param {String} paramName
   * @param {String|Number} paramValue
   * @returns {String}
   */
  static replaceParamValue(inUrl, paramName, paramValue) {
    let newUrl = inUrl;

    const paramNameRegex = new RegExp(`:${paramName}`, 'g');
    newUrl = newUrl.replace(paramNameRegex, paramValue);

    return newUrl;
  }

  /**
   * Original URL used on instantiation
   * @private
   * @type {String}
   */
  _originalURL = '';

  /**
   * Current map of parameters
   * @private
   * @type {Record<String, String|Number>}
   */
  _params = {};

  /**
   * Get the parameters used in the current URL
   * @returns {Record<String, String|Number>}
   */
  get params() {
    return this._params;
  }

  /**
   * Set the current URL parameters
   * @param parametersMap {Record<String, String|Number>}
   */
  set params(parametersMap) {
    let newHref = this._originalURL;

    this._params = {};

    for (const [paramName, paramValue] of Object.entries(parametersMap)) {
      newHref = RouteURL.replaceParamValue(newHref, paramName, paramValue);

      if (newHref !== this._originalURL) {
        this._params[paramName] = paramValue;
      }
    }

    this.href = newHref;
  }

  /**
   * Create a route URL to easily manage your application routing
   * @param {String} url
   */
  constructor(url) {
    super(url);

    this._originalURL = url;
    this.clear();
  }

  /**
   * Set the value of a known URL parameter
   * @param {String} newParamName
   * @param {String|Number} newParamValue
   * @returns {RouteURL}
   */
  setParameter(newParamName, newParamValue = 0) {
    this.params = Object.assign({}, this.params, {
      [newParamName]: newParamValue,
    });

    return this;
  }

  /**
   * Create another route with the same URL, but with different parameters
   * @param {Record<String, String|Number} withParameters Parameter map
   * @returns {RouteURL}
   */
  clone(withParameters) {
    const newRoute = RouteURL.create(this._originalURL, withParameters);

    return newRoute;
  }

  /**
   * Reset the parameters of the current route
   * @returns {RouteURL}
   */
  clear() {
    this.params = RouteURL.getParametersFromURL(this._originalURL);

    return this;
  }
}

export default RouteURL;
