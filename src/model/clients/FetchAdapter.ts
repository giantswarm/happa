import { GenericResponse } from 'model/clients/GenericResponse';
import {
  HttpClientImpl,
  HttpRequestMethods,
  IHttpClient,
} from 'model/clients/HttpClient';

/**
 * This is an adapter for using an HttpClient with the same
 * interface as the global `fetch` function.
 */
class FetchAdapter<T extends IHttpClient = HttpClientImpl> {
  public readonly baseClient: T;

  constructor(baseClient: T) {
    this.baseClient = baseClient;
  }

  private configureFromRequestInfo(reqInfo: RequestInfo) {
    if (typeof reqInfo === 'string') {
      this.baseClient.setURL(reqInfo);

      return;
    }

    // Copy headers.
    for (const [key, value] of reqInfo.headers.entries()) {
      this.baseClient.setHeader(key, value);
    }

    // Copy request method.
    this.baseClient.setRequestMethod(reqInfo.method as HttpRequestMethods);

    // Copy the request body.
    this.baseClient.setBody(JSON.stringify(reqInfo.body) as never);
  }

  private configureFromRequestInit(reqInit?: RequestInit) {
    if (!reqInit) return;

    const { headers, method, body } = reqInit;

    if (headers) {
      // Copy headers.
      const newHeaders = new Headers(headers);
      for (const [key, value] of newHeaders.entries()) {
        this.baseClient.setHeader(key, value);
      }
    }

    if (method) {
      // Copy request method.
      this.baseClient.setRequestMethod(method as HttpRequestMethods);
    }

    if (body) {
      // Copy the request body.
      this.baseClient.setBody(JSON.stringify(body) as never);
    }
  }

  public async fetch(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<Response> {
    this.configureFromRequestInfo(input);
    this.configureFromRequestInit(init);

    try {
      const result = await this.baseClient.execute();

      return Promise.resolve(result.convertToFetchResponse());
    } catch (err) {
      if (err instanceof GenericResponse) {
        return Promise.reject(err.convertToFetchResponse());
      }

      return Promise.reject(err);
    }
  }
}

export default FetchAdapter;
