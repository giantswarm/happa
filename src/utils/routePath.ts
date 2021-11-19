type ParameterValue = string | number;

/**
 * An easy to use manager for in-app routes.
 */
class RoutePath {
  /**
   * Generate route path with parameters.
   * @param template
   * @param parameters
   */
  public static create(
    template: string,
    parameters: Record<string, ParameterValue> = {}
  ): RoutePath {
    const newRoute = new RoutePath(template);
    newRoute.params = parameters;

    return newRoute;
  }

  /**
   * Generate a usable string path with parameters.
   * @param template
   * @param parameters
   */
  public static createUsablePath(
    template: string,
    parameters: Record<string, ParameterValue> = {}
  ) {
    return RoutePath.create(template, parameters).value;
  }

  /**
   * Get a parameter map based on a known path.
   * @param template
   */
  public static getParametersFromPath(
    template: string
  ): Record<string, ParameterValue> {
    let currentParamName = '';
    let currentMatch = null;

    /**
     * Allows a name that starts with `/:',
     * and which can contain uppercase/lowercase
     * letters, `-`, and `_`.
     */
    const validationRegex = /\/:([a-zA-Z_\-]*)(\/)?/g;
    const params: Record<string, ParameterValue> = {};

    do {
      currentMatch = validationRegex.exec(template);

      if (currentMatch === null) break;

      currentParamName = currentMatch[1];

      params[currentParamName] = 0;
    } while (currentMatch);

    return params;
  }

  /**
   * Replace a known parameter in a path with a value
   * @param inPath - Path to use.
   * @param paramName
   * @param paramValue
   */
  public static replaceParamValue(
    inPath: string,
    paramName: string,
    paramValue: ParameterValue
  ) {
    const paramNameRegex = new RegExp(`:${paramName}`, 'g');
    const value =
      typeof paramValue === 'string' ? paramValue : String(paramValue);
    const newPath = inPath.replace(paramNameRegex, value);

    return newPath;
  }

  /**
   * Convert a known path to an editable path,
   * by providing the template that it implements.
   *
   * Useful for finding parameter values inside
   * stringified paths.
   * @param pathTemplate
   * @param path
   */
  public static parseWithTemplate(pathTemplate: string, path: string) {
    /**
     * Allows a name that starts with `:',
     * and which can contain uppercase/lowercase
     * letters, `-`, and `_`.
     */
    const paramValidationRegex = /:([a-zA-Z_\-]*)(\/)?/g;

    const templateParts = pathTemplate.split('/');
    const pathParts = path.split('/');

    const params: Record<string, ParameterValue> = {};

    for (let i = 0; i < templateParts.length; i++) {
      const currentTemplatePart = templateParts[i];
      const currentMatch = paramValidationRegex.exec(currentTemplatePart);

      if (currentMatch === null) continue;

      const currentParamName = currentMatch[1];
      let valueInPath: ParameterValue = pathParts[i];

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
   * Get the parameters used in the current path.
   */
  get params() {
    return this._params;
  }

  /**
   * Set the current path parameters
   * @param parametersMap
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
   * Get the original path used for instantiating the route.
   */
  get originalTemplate() {
    return this._originalTemplate;
  }

  // eslint-disable-next-line class-methods-use-this
  set originalTemplate(_newPath) {
    // No-op.
  }

  /**
   * Current formatted value.
   */
  get value() {
    return this._value;
  }

  // eslint-disable-next-line class-methods-use-this
  set value(_newValue) {
    // No-op.
  }

  /**
   * Create a route path to easily manage your application routing
   * @param path
   */
  constructor(path: string) {
    this._originalTemplate = path;
    this._originalParams = RoutePath.getParametersFromPath(
      this._originalTemplate
    );

    this.clear();
  }

  /**
   * Set the value of a known path parameter.
   * @param newParamName
   * @param newParamValue
   */
  public setParameter(newParamName: string, newParamValue: ParameterValue = 0) {
    this.params = Object.assign({}, this.params, {
      [newParamName]: newParamValue,
    });

    return this;
  }

  /**
   * Create another route with the same path, but with different parameters.
   * @param withParameters - Parameter map.
   */
  public clone(withParameters: Record<string, ParameterValue> = {}) {
    const newRoute = RoutePath.create(this._originalTemplate, withParameters);

    return newRoute;
  }

  /**
   * Reset the parameters of the current route.
   */
  public clear() {
    this.params = {};

    return this;
  }

  /**
   * Original path template used on instantiation.
   */
  protected _originalTemplate = '';

  /**
   * Original params derived from
   * the template used on instantiation.
   */
  protected _originalParams: Record<string, ParameterValue> = {};

  /**
   * Formatted value.
   */
  protected _value = '';

  /**
   * Map of current parameters.
   */
  protected _params: Record<string, ParameterValue> = {};
}

export default RoutePath;
