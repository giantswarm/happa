import { StatusCodes } from 'model/constants';

import { IHttpResponseConfig } from './GenericResponse';
import { HttpBody } from './HttpClient';

export class GenericResponseError<T = HttpBody> extends Error {
  protected readonly config: IHttpResponseConfig<T> = {
    status: 200,
    message: 'Request successful!',
    data: {} as T,
    headers: {},
    requestConfig: null,
  };

  constructor(status: number = StatusCodes.Ok, data: T = {} as T) {
    super();

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
}
