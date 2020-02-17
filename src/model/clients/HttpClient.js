import axios from 'axios';
import { AuthorizationTypes } from 'shared';

export const HttpRequestMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

class HttpClient {
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

  headers = {};

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

    this.requestConfig.headers = Object.assign(
      {},
      this.requestConfig.headers,
      this.headers
    );
  }

  setHeader(key, value) {
    this.headers[key] = value;
  }

  setAuthorizationToken(token) {
    this.headers.Authorization = `${AuthorizationTypes.BEARER} ${token}`;
  }

  async execute() {
    try {
      const response = await axios({
        url: this.requestConfig.url,
        method: this.requestConfig.method,
        baseURL: this.requestConfig.baseURL,
        headers: this.requestConfig.headers,
        data: this.requestConfig.body,
        timeout: this.requestConfig.timeout,
      });

      return response.data;
    } catch (err) {
      return Promise.reject(err.response.data);
    }
  }
}

export default HttpClient;
