import axios from 'axios';

import { GenericResponse } from './GenericResponse';

/**
 * The HTTP request methods
 * @readonly
 * @enum {string}
 */
export const HttpRequestMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

/**
 * @typedef  {Object} HttpClientConfig
 * @property {string} [baseURL]
 * @property {number} [timeout=10000]
 * @property {Record<string, string>} [headers]
 * @property {string} [url=""]
 * @property {HttpRequestMethods} [method="GET"]
 * @property {Record<string, any>} [data]
 */

/**
 * A helper class for creating HTTP requests
 */
export class HttpClient {
  /**
   * Shorthand function to execute a `GET` request
   * @param {string} url - The target URL
   * @param {HttpClientConfig} config - The client's configuration
   * @return {Promise<import('./GenericResponse').GenericResponse>}
   * @throws {Promise<import('./GenericResponse').GenericResponse>} The response has a non-2xx status code or the client has a bad configuration
   */
  static get(url, config) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.GET,
    });
    const newClient = new HttpClient(boundConfig);

    return newClient.execute();
  }

  /**
   * Shorthand function to execute a `POST` request
   * @param {string} url - The target URL
   * @param {HttpClientConfig} config - The client's configuration
   * @return {Promise<import('./GenericResponse').GenericResponse>}
   * @throws {Promise<import('./GenericResponse').GenericResponse>} The response has a non-2xx status code or the client has a bad configuration
   */
  static post(url, config) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.POST,
    });
    const newClient = new HttpClient(boundConfig);

    return newClient.execute();
  }

  /**
   * Shorthand function to execute a `PUT` request
   * @param {string} url - The target URL
   * @param {HttpClientConfig} config - The client's configuration
   * @return {Promise<import('./GenericResponse').GenericResponse>}
   * @throws {Promise<import('./GenericResponse').GenericResponse>} The response has a non-2xx status code or the client has a bad configuration
   */
  static put(url, config) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.PUT,
    });
    const newClient = new HttpClient(boundConfig);

    return newClient.execute();
  }

  /**
   * Shorthand function to execute a `{PATCH}` request
   * @param {string} url - The target URL
   * @param {HttpClientConfig} config - The client's configuration
   * @return {Promise<import('./GenericResponse').GenericResponse>}
   * @throws {Promise<import('./GenericResponse').GenericResponse>} The response has a non-2xx status code or the client has a bad configuration
   */
  static patch(url, config) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.PATCH,
    });
    const newClient = new HttpClient(boundConfig);

    return newClient.execute();
  }

  /**
   * Shorthand function to execute a `DELETE` request
   * @param {string} url - The target URL
   * @param {HttpClientConfig} config - The client's configuration
   * @return {Promise<import('./GenericResponse').GenericResponse>}
   * @throws {Promise<import('./GenericResponse').GenericResponse>} The response has a non-2xx status code or the client has a bad configuration
   */
  static delete(url, config) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.DELETE,
    });
    const newClient = new HttpClient(boundConfig);

    return newClient.execute();
  }

  /**
   * The client's configuration
   * @readonly
   * @type {HttpClientConfig}
   */
  requestConfig = {};

  /**
   * Create a HTTP client
   * @param {HttpClientConfig} [config] - The client's configuration
   */
  constructor(config) {
    this.setRequestConfig(config);
  }

  /**
   * Set the client's configuration manually
   * @param {HttpClientConfig} config - The client's configuration
   */
  setRequestConfig(config) {
    this.requestConfig = Object.assign(
      {},
      {
        url: '',
        method: HttpRequestMethods.GET,
        timeout: 10000,
      },
      config
    );

    this.requestConfig.headers = Object.assign({}, config?.headers);

    return this;
  }

  /**
   * Set a request header
   * @param {string} key - Header name
   * @param {string} [value=""] - Header value
   */
  setHeader(key, value = '') {
    this.requestConfig.headers[key] = value;

    return this;
  }

  /**
   * Set an authentication header
   * @param {string} authType - Authorization Scheme
   * @param {string} token - Authorization token
   */
  setAuthorizationToken(authType, token) {
    this.setHeader('Authorization', `${authType} ${token}`);

    return this;
  }

  /**
   * Set the request method
   * @param {HttpRequestMethods} method - The request method
   */
  setRequestMethod(method) {
    this.requestConfig.method = method;

    return this;
  }

  /**
   * Set the request body contents
   * @param {Record<string, any>} body - The body contents
   */
  setBody(body) {
    this.requestConfig.data = body;

    return this;
  }

  /**
   * Set the request target URL
   * @param {string} url - The URL
   */
  setURL(url) {
    this.requestConfig.url = url;

    return this;
  }

  /**
   * @param {HttpClientConfig} reqConfig - The client's configuration
   * @return {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this, no-empty-function
  async onBeforeRequest(_reqConfig) {}

  /**
   * Execute the client's request
   * @return {Promise<import('./GenericResponse').GenericResponse>}
   * @throws {Promise<import('./GenericResponse').GenericResponse>} The response has a non-2xx status code or the client has a bad configuration
   */
  async execute() {
    const { baseURL, timeout, headers, url, method, data } = this.requestConfig;

    const res = new GenericResponse();
    res.requestConfig = this.requestConfig;

    try {
      await this.onBeforeRequest(this.requestConfig);

      const response = await axios({
        baseURL,
        timeout,
        headers,
        url,
        method,
        data,
      });

      res.status = response.status;
      res.data = response.data;
      res.message = response.statusText;
      res.headers = response.headers;

      return res;
    } catch (err) {
      res.status = 400;
      res.message = `This is embarrassing, we couldn't execute this request. Please try again in a few moments.`;

      // We got a non-2xx status code.
      if (err.response) {
        res.status = err.response.status;
        res.message = err.code;
        res.headers = err.response.headers;
        res.data = err.response.data;
      }

      return Promise.reject(res);
    }
  }
}
