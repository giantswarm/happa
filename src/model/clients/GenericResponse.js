/**
 * @typedef  {Object} HttpReponseConfig
 * @property {number} status
 * @property {string} message
 * @property {?Record<string, any>} data
 * @property {?Record<string, string>} headers
 * @property {?import('./HttpClient').HttpClientConfig} requestConfig
 */

/**
 * A helper class for encapsulating HTTP responses
 */
export class GenericResponse {
  /**
   * The response's configuration
   * @readonly
   * @type {HttpReponseConfig}
   */
  config = {
    status: 200,
    message: 'Request successful!',
    data: null,
    headers: null,
    requestConfig: null,
  };

  /**
   * Create a HTTP Response
   * @param {?number} status [status=200] - Status Code
   * @param {?Record<string, any>} [data=null] - Response data
   */
  // eslint-disable-next-line no-magic-numbers
  constructor(status = 200, data = null) {
    this.status = status;
    this.data = data;
  }

  /**
   * The response message
   * @param {string} message
   */
  set message(message) {
    this.config.message = message;
  }

  get message() {
    return this.config.message;
  }

  /**
   * The response body
   * @param {?Record<string, any>} data
   */
  set data(data) {
    this.config.data = data;
  }

  get data() {
    return this.config.data;
  }

  /**
   * The response status code
   * @param {number} status
   */
  set status(status) {
    this.config.status = status;
  }

  get status() {
    return this.config.status;
  }

  /**
   * The configuration of the request that got this response
   * @param {import('./HttpClient').HttpClientConfig} requestConfig
   */
  set requestConfig(requestConfig) {
    this.config.requestConfig = requestConfig;
  }

  get requestConfig() {
    return this.config.requestConfig;
  }

  /**
   * Set a response header
   * @param {string} key - Header name
   * @param {string} [value=""] - Header Value
   */
  setHeader(key, value = '') {
    this.config.headers[key] = value;
  }

  /**
   * The response headers
   * @param {Record<string, string>} headers
   */
  set headers(headers) {
    this.config.headers = Object.assign({}, headers);
  }

  get headers() {
    return Object.assign({}, this.config.headers);
  }

  /**
   * Convert the object to a `Response` object returned by the fetch command.
   * @returns {Response}
   */
  convertToFetchResponse() {
    // Set headers.
    const headers = new Headers();
    for (const [key, value] of Object.entries(this.headers)) {
      headers.append(key, value);
    }

    const data = JSON.stringify(this.data);

    const resultingResponse = new Response(data, {
      headers: headers,
      status: this.status,
      statusText: this.message,
    });

    return resultingResponse;
  }
}
