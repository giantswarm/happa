import axios from 'axios';
import { AuthorizationTypes } from 'shared';

export const HttpRequestMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

export class HttpClient {
  static get(url, config) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.GET,
    });
    const newClient = new HttpClient(boundConfig);

    return newClient.execute();
  }

  static post(url, config) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.POST,
    });
    const newClient = new HttpClient(boundConfig);

    return newClient.execute();
  }

  static put(url, config) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.PUT,
    });
    const newClient = new HttpClient(boundConfig);

    return newClient.execute();
  }

  static patch(url, config) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.PATCH,
    });
    const newClient = new HttpClient(boundConfig);

    return newClient.execute();
  }

  static delete(url, config) {
    const boundConfig = Object.assign({}, config, {
      url,
      method: HttpRequestMethods.DELETE,
    });
    const newClient = new HttpClient(boundConfig);

    return newClient.execute();
  }

  requestConfig = {};

  constructor(config) {
    this.setRequestConfig(config);
  }

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

    this.requestConfig.headers = Object.assign({}, config.headers);
  }

  setHeader(key, value) {
    this.requestConfig.headers[key] = value;
  }

  setAuthorizationToken(token) {
    this.setHeader('Authorization', `${AuthorizationTypes.BEARER} ${token}`);
  }

  setRequestMethod(method) {
    this.requestConfig.method = method;
  }

  setBody(body) {
    this.requestConfig.body = body;
  }

  setURL(url) {
    this.requestConfig.url = url;
  }

  // eslint-disable-next-line no-unused-vars,class-methods-use-this, no-empty-function
  async onBeforeRequest(reqConfig) {}

  async execute() {
    const {
      baseURL,
      timeout,
      headers,
      url,
      method,
      body: data,
    } = this.requestConfig;

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

      return response.data;
    } catch (err) {
      return Promise.reject(err.response.data);
    }
  }
}
