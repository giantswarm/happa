import { StatusCodes } from 'shared/constants';

import { GenericResponse } from './GenericResponse';
import { GenericResponseError } from './GenericResponseError';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HttpBody = Record<string, any> | string;

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
  data?: HttpBody;
  baseURL?: string;
  forceCORS?: boolean;
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
  setBody(body: HttpBody): IHttpClient;
  /**
   * Set the request target URL.
   * @param url
   */
  setURL(url: string): IHttpClient;
  /**
   * Execute the client's request.
   * @throws {GenericResponse} The response has a non-2xx status code or the client has a bad configuration.
   */
  execute<T>(): Promise<GenericResponse<T>>;
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
  static get<T = HttpBody>(
    url: string,
    config: Partial<IHttpClientConfig>
  ): Promise<GenericResponse<T>> {
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
  static post<T = HttpBody>(
    url: string,
    config: Partial<IHttpClientConfig>
  ): Promise<GenericResponse<T>> {
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
  static put<T = HttpBody>(
    url: string,
    config: Partial<IHttpClientConfig>
  ): Promise<GenericResponse<T>> {
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
  static patch<T = HttpBody>(
    url: string,
    config: Partial<IHttpClientConfig>
  ): Promise<GenericResponse<T>> {
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
  static delete<T = HttpBody>(
    url: string,
    config: Partial<IHttpClientConfig>
  ): Promise<GenericResponse<T>> {
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
    headers: {
      'Content-Type': 'application/json',
    },
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

  setBody(body: HttpBody) {
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

  async execute<T = HttpBody>(): Promise<GenericResponse<T>> {
    const currRequestConfig = this.getRequestConfig();
    const {
      baseURL,
      headers,
      url,
      method,
      data,
      forceCORS,
      timeout,
    } = currRequestConfig;

    try {
      await this.onBeforeRequest(currRequestConfig);

      const abortController = new AbortController();
      const timer = setTimeout(() => abortController.abort(), timeout);

      const reqURL = new URL(url, baseURL);
      const req = new Request(reqURL.toString(), {
        method,
        headers,
        body: JSON.stringify(data),
        mode: forceCORS ? 'cors' : undefined,
        signal: abortController.signal,
      });

      const response = await fetch(req);

      clearTimeout(timer);

      if (!response.ok) throw response;

      const res = new GenericResponse<T>();
      res.data = (await getResponseData(response)) as T;
      res.requestConfig = currRequestConfig;
      res.status = response.status;
      res.message = response.statusText;

      for (const [key, value] of response.headers.entries()) {
        res.setHeader(key, value);
      }

      return res;
    } catch (err) {
      const res = new GenericResponseError<T>();
      res.requestConfig = currRequestConfig;
      res.status = StatusCodes.BadRequest;
      res.message = `We couldn't execute a request. Please try again in a few moments.`;

      if (err.name === 'AbortError') {
        res.status = StatusCodes.Timeout;
        res.message = `Your request exceeded the maximum timeout of ${timeout}ms.`;
        res.headers = Object.assign({}, headers);

        return Promise.reject(res);
      }

      // We got a non-2xx status code.
      if (err instanceof Response) {
        res.data = (await getResponseData(err)) as T;
        res.status = err.status;
        res.message = err.statusText;

        if (res.message.length < 1 && typeof res.data === 'string') {
          res.message = res.data;
        }

        for (const [key, value] of err.headers.entries()) {
          res.setHeader(key, value);
        }
      }

      return Promise.reject(res);
    }
  }
}

async function getResponseData(response: Response): Promise<HttpBody> {
  let data: HttpBody = '';

  try {
    data = await response.text();
    data = JSON.parse(data);
  } catch {
    // Ignore errors.
  }

  return data;
}
