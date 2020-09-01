import { IHttpClientConfig } from 'model/clients/HttpClient';

interface IHttpResponseConfig<T> {
  status: number;
  message: string;
  data: T;
  headers: Record<string, string>;
  requestConfig: IHttpClientConfig | null;
}

/**
 * A helper class for encapsulating HTTP responses.
 */
export class GenericResponse<T = Record<string, unknown>> {
  /**
   * The response's configuration.
   */
  protected readonly config: IHttpResponseConfig<T> = {
    status: 200,
    message: 'Request successful!',
    data: {} as T,
    headers: {},
    requestConfig: null,
  };

  /**
   * Create a HTTP Response.
   * @param status - Status Code
   * @param data - Response data
   */
  // eslint-disable-next-line no-magic-numbers
  constructor(status: number = 200, data: T = {} as T) {
    this.status = status;
    this.data = data;
  }

  /**
   * The response message.
   * @param message
   */
  set message(message) {
    this.config.message = message;
  }

  get message() {
    return this.config.message;
  }

  /**
   * The response body.
   * @param data
   */
  set data(data) {
    this.config.data = data;
  }

  get data() {
    return this.config.data;
  }

  /**
   * The response status code.
   * @param status
   */
  set status(status) {
    this.config.status = status;
  }

  get status() {
    return this.config.status;
  }

  /**
   * The configuration of the request that got this response.
   * @param requestConfig
   */
  set requestConfig(requestConfig) {
    this.config.requestConfig = requestConfig;
  }

  get requestConfig() {
    return this.config.requestConfig;
  }

  /**
   * Set a response header
   * @param key - Header name
   * @param value - Header Value
   */
  setHeader(key: string, value = '') {
    this.config.headers[key] = value;
  }

  /**
   * The response headers.
   * @param headers
   */
  set headers(headers) {
    this.config.headers = Object.assign({}, headers);
  }

  get headers() {
    return Object.assign({}, this.config.headers);
  }

  /**
   * Convert the object to a `Response` object returned by the fetch command.
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
