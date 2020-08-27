import axios from 'axios';

import { GenericResponse } from './GenericResponse';

export enum HttpRequestMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export interface IHttpClientConfig {
  timeout: number;
  headers: Record<string, string>;
  url: string;
  method: HttpRequestMethods;
  data?: Record<string, unknown>;
  baseURL?: string;
}

export interface IHttpClient {
  /**
   * Set the client's configuration manually.
   * @param config - The client's configuration.
   */
  setRequestConfig(config: Partial<IHttpClientConfig>): IHttpClient;
  /**
   * Get the existing configuration.
   */
  getRequestConfig(): IHttpClientConfig;
  /**
   * Set a request header.
   * @param key
   * @param value
   */
  setHeader(key: string, value?: string): IHttpClient;
  /**
   * Set an authentication header.
   * @param authType - Authorization Scheme.
   * @param token - Authorization token.
   */
  setAuthorizationToken(authType: string, token: string): IHttpClient;
  /**
   * Set the request method.
   * @param method
   */
  setRequestMethod(method: HttpRequestMethods): IHttpClient;
  /**
   * Set the request body contents.
   * @param body
   */
  setBody(body: Record<string, unknown>): IHttpClient;
  /**
   * Set the request target URL.
   * @param url
   */
  setURL(url: string): IHttpClient;
  /**
   * Execute the client's request.
   * @throws {GenericResponse} The response has a non-2xx status code or the client has a bad configuration.
   */
  execute(): Promise<GenericResponse>;
  /**
   * Override this function to run a custom hook before each request.
   * @param reqConfig - The client's configuration.
   */
  onBeforeRequest?(reqConfig: IHttpClientConfig): Promise<void>;
}

/**
 * A helper class for creating HTTP requests.
 */
export class HttpClientImpl implements IHttpClient {
  /**
   * Shorthand function to execute a `GET` request.
   * @param url - The target URL.
   * @param config - The client's configuration.
   * @throws {GenericResponse} The response has a non-2xx status code or the client has a bad configuration.
   */
  static get(url: string, config: Partial<IHttpClientConfig>) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.GET,
    });
    const newClient = new HttpClientImpl(boundConfig);

    return newClient.execute();
  }

  /**
   * Shorthand function to execute a `POST` request.
   * @param url - The target URL.
   * @param config - The client's configuration.
   * @throws {GenericResponse} The response has a non-2xx status code or the client has a bad configuration.
   */
  static post(url: string, config: Partial<IHttpClientConfig>) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.POST,
    });
    const newClient = new HttpClientImpl(boundConfig);

    return newClient.execute();
  }

  /**
   * Shorthand function to execute a `PUT` request.
   * @param url - The target URL.
   * @param config - The client's configuration.
   * @throws {GenericResponse} The response has a non-2xx status code or the client has a bad configuration.
   */
  static put(url: string, config: Partial<IHttpClientConfig>) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.PUT,
    });
    const newClient = new HttpClientImpl(boundConfig);

    return newClient.execute();
  }

  /**
   * Shorthand function to execute a `PATCH` request.
   * @param url - The target URL.
   * @param config - The client's configuration.
   * @throws {GenericResponse} The response has a non-2xx status code or the client has a bad configuration.
   */
  static patch(url: string, config: Partial<IHttpClientConfig>) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.PATCH,
    });
    const newClient = new HttpClientImpl(boundConfig);

    return newClient.execute();
  }

  /**
   * Shorthand function to execute a `DELETE` request.
   * @param url - The target URL.
   * @param config - The client's configuration.
   * @throws {GenericResponse} The response has a non-2xx status code or the client has a bad configuration.
   */
  static delete(url: string, config: Partial<IHttpClientConfig>) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.DELETE,
    });
    const newClient = new HttpClientImpl(boundConfig);

    return newClient.execute();
  }

  private static defaultConfig: IHttpClientConfig = {
    url: '',
    method: HttpRequestMethods.GET,
    timeout: 10000,
    headers: {},
  };

  /**
   * The client's configuration.
   */
  protected requestConfig: IHttpClientConfig = Object.assign(
    {},
    HttpClientImpl.defaultConfig
  );

  /**
   * Create a HTTP client.
   * @param config - The client's configuration.
   */
  constructor(config?: Partial<IHttpClientConfig>) {
    if (config) {
      this.setRequestConfig(config);
    }
  }

  setRequestConfig(config: Partial<IHttpClientConfig>) {
    this.requestConfig = Object.assign(
      {},
      HttpClientImpl.defaultConfig,
      config
    );

    if (config.headers) {
      this.requestConfig.headers = Object.assign({}, config.headers);
    }

    return this;
  }

  getRequestConfig(): IHttpClientConfig {
    return Object.assign({}, this.requestConfig);
  }

  setHeader(key: string, value = '') {
    this.requestConfig.headers[key] = value;

    return this;
  }

  setAuthorizationToken(authType: string, token: string) {
    this.setHeader('Authorization', `${authType} ${token}`);

    return this;
  }

  setRequestMethod(method: HttpRequestMethods) {
    this.requestConfig.method = method;

    return this;
  }

  setBody(body: Record<string, unknown>) {
    this.requestConfig.data = body;

    return this;
  }

  setURL(url: string) {
    this.requestConfig.url = url;

    return this;
  }

  /**
   * Override this function to run a custom hook before each request.
   * @param _reqConfig - The client's configuration.
   */
  // eslint-disable-next-line class-methods-use-this, no-empty-function
  async onBeforeRequest(_reqConfig: IHttpClientConfig): Promise<void> {}

  async execute() {
    const currRequestConfig = this.getRequestConfig();
    const { baseURL, timeout, headers, url, method, data } = currRequestConfig;

    const res = new GenericResponse();

    try {
      await this.onBeforeRequest(currRequestConfig);

      const response = await axios({
        baseURL,
        timeout,
        headers,
        url,
        method,
        data,
      });

      res.requestConfig = currRequestConfig;
      res.status = response.status;
      res.data = response.data;
      res.message = response.statusText;
      res.headers = response.headers;

      return res;
    } catch (err) {
      res.requestConfig = currRequestConfig;
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
