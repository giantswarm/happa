import axios from 'axios';
import nock from 'nock';
import { generateRandomString } from 'testUtils/mockHttpCalls';

import {
  HttpClient,
  HttpRequestMethods,
  IHttpClientConfig,
} from '../HttpClient';

describe('HttpClient', () => {
  beforeAll(() => {
    // Use axios' node http adapter, so we could mock requests
    axios.defaults.adapter = require('axios/lib/adapters/http');
  });

  it('is constructed with a request config', () => {
    const client = new HttpClient();

    // Has defaults
    expect(client.getRequestConfig()).toStrictEqual({
      url: '',
      method: 'GET',
      timeout: 10000,
      headers: {},
    });

    const config: Partial<IHttpClientConfig> = {
      baseURL: 'https://httpclient.com',
      timeout: 30000,
      headers: {
        'Test header': 'test value',
      },
      url: '/api/test',
      method: HttpRequestMethods.POST,
      data: {
        test: 'test',
      },
    };

    // Can be set manually
    client.setRequestConfig(config);

    expect(client.getRequestConfig()).toStrictEqual(config);
  });

  it('can be configured with various setters', () => {
    // eslint-disable-next-line no-magic-numbers
    const token = generateRandomString(15);
    const config: Partial<IHttpClientConfig> = {
      baseURL: 'https://httpclient.com',
      timeout: 30000,
      headers: {
        TestHeader: '',
        TestHeader2: 'test value',
        TestHeader3: 'test value',
        Authorization: `testScheme ${token}`,
      },
      url: '/api/test',
      method: HttpRequestMethods.POST,
      data: {
        test: 'test',
      },
    };

    const client = new HttpClient({
      baseURL: 'https://httpclient.com',
      timeout: 30000,
    });

    client
      .setHeader('TestHeader')
      .setHeader(
        'TestHeader2',
        (config.headers as IHttpClientConfig['headers']).TestHeader2
      )
      .setHeader(
        'TestHeader3',
        (config.headers as IHttpClientConfig['headers']).TestHeader3
      )
      .setAuthorizationToken('testScheme', token)
      .setRequestMethod(HttpRequestMethods.POST)
      .setBody({
        test: 'test',
      })
      .setURL('/api/test');

    expect(client.getRequestConfig()).toStrictEqual(config);
  });

  it('executes a request with the given config', async () => {
    nock('https://httpclient.com')
      .post('/api/test', {
        test: 'test',
      })
      // eslint-disable-next-line no-magic-numbers
      .reply(200, {
        testResponse: 'test value',
      });

    const config: Partial<IHttpClientConfig> = {
      baseURL: 'https://httpclient.com',
      timeout: 30000,
      headers: {
        TestHeader: 'test value',
        TestHeader2: 'test value',
        TestHeader3: 'test value',
      },
      url: '/api/test',
      method: HttpRequestMethods.POST,
      data: {
        test: 'test',
      },
    };
    const client = new HttpClient(config);
    const result = await client.execute();

    expect(result.data).toStrictEqual({
      testResponse: 'test value',
    });
  });

  it('executes a given hook before executing a request', async () => {
    nock('https://httpclient.com')
      .get('/api/test')
      // eslint-disable-next-line no-magic-numbers
      .reply(200, {
        testResponse: 'test value',
      });

    const config: Partial<IHttpClientConfig> = {
      baseURL: 'https://httpclient.com',
      timeout: 30000,
      headers: {
        TestHeader: 'test value',
        TestHeader2: 'test value',
        TestHeader3: 'test value',
      },
      url: '/api/test',
      method: HttpRequestMethods.GET,
    };
    const client = new HttpClient(config);

    const beforeReqHook = jest.fn();
    beforeReqHook.mockResolvedValue(true);
    client.onBeforeRequest = beforeReqHook;

    const result = await client.execute();

    expect(beforeReqHook).toHaveBeenCalledWith(config);

    expect(result.data).toStrictEqual({
      testResponse: 'test value',
    });
  });

  it('executes GET requests with the shorthand command', async () => {
    nock('https://httpclient.com')
      .get('/api/test')
      // eslint-disable-next-line no-magic-numbers
      .reply(200, {
        testResponse: 'test value',
      });

    const config: Partial<IHttpClientConfig> = {
      baseURL: 'https://httpclient.com',
      timeout: 30000,
      headers: {
        TestHeader: 'test value',
        TestHeader2: 'test value',
        TestHeader3: 'test value',
      },
    };
    const result = await HttpClient.get('/api/test', config);

    expect(result.data).toStrictEqual({
      testResponse: 'test value',
    });
  });

  it('executes POST requests with the shorthand command', async () => {
    nock('https://httpclient.com')
      .post('/api/test', {
        test: 'test',
      })
      // eslint-disable-next-line no-magic-numbers
      .reply(200, {
        testResponse: 'test value',
      });

    const config: Partial<IHttpClientConfig> = {
      baseURL: 'https://httpclient.com',
      timeout: 30000,
      headers: {
        TestHeader: 'test value',
        TestHeader2: 'test value',
        TestHeader3: 'test value',
      },
      data: {
        test: 'test',
      },
    };
    const result = await HttpClient.post('/api/test', config);

    expect(result.data).toStrictEqual({
      testResponse: 'test value',
    });
  });

  it('executes PUT requests with the shorthand command', async () => {
    nock('https://httpclient.com')
      .put('/api/test', {
        test: 'test',
      })
      // eslint-disable-next-line no-magic-numbers
      .reply(200, {
        testResponse: 'test value',
      });

    const config: Partial<IHttpClientConfig> = {
      baseURL: 'https://httpclient.com',
      timeout: 30000,
      headers: {
        TestHeader: 'test value',
        TestHeader2: 'test value',
        TestHeader3: 'test value',
      },
      data: {
        test: 'test',
      },
    };
    const result = await HttpClient.put('/api/test', config);

    expect(result.data).toStrictEqual({
      testResponse: 'test value',
    });
  });

  it('executes PATCH requests with the shorthand command', async () => {
    nock('https://httpclient.com')
      .patch('/api/test', {
        test: 'test',
      })
      // eslint-disable-next-line no-magic-numbers
      .reply(200, {
        testResponse: 'test value',
      });

    const config: Partial<IHttpClientConfig> = {
      baseURL: 'https://httpclient.com',
      timeout: 30000,
      headers: {
        TestHeader: 'test value',
        TestHeader2: 'test value',
        TestHeader3: 'test value',
      },
      data: {
        test: 'test',
      },
    };
    const result = await HttpClient.patch('/api/test', config);

    expect(result.data).toStrictEqual({
      testResponse: 'test value',
    });
  });

  it('executes DELETE requests with the shorthand command', async () => {
    nock('https://httpclient.com')
      .delete('/api/test')
      // eslint-disable-next-line no-magic-numbers
      .reply(200, {
        testResponse: 'test value',
      });

    const config: Partial<IHttpClientConfig> = {
      baseURL: 'https://httpclient.com',
      timeout: 30000,
      headers: {
        TestHeader: 'test value',
        TestHeader2: 'test value',
        TestHeader3: 'test value',
      },
    };
    const result = await HttpClient.delete('/api/test', config);

    expect(result.data).toStrictEqual({
      testResponse: 'test value',
    });
  });

  it('provides an error if the request fails', async () => {
    nock('https://httpclient.com')
      .get('/api/test')
      // eslint-disable-next-line no-magic-numbers
      .reply(404, {
        testResponse: 'test value',
      });

    const config: Partial<IHttpClientConfig> = {
      baseURL: 'https://httpclient.com',
      timeout: 30000,
      headers: {
        TestHeader: 'test value',
        TestHeader2: 'test value',
        TestHeader3: 'test value',
      },
    };

    try {
      await HttpClient.get('/api/test', config);
    } catch (err) {
      expect(err.data).toStrictEqual({
        testResponse: 'test value',
      });
    }
  });

  it('provides an error if the request is misconfigured', async () => {
    const config: Partial<IHttpClientConfig> = {
      baseURL: 'https://httpclient.com',
      timeout: 30000,
      headers: {
        TestHeader: 'test value',
        TestHeader2: 'test value',
        TestHeader3: 'test value',
      },
    };

    try {
      await HttpClient.get(({ url: '/api/test' } as unknown) as string, config);
    } catch (err) {
      expect(err.message).toStrictEqual(
        `This is embarrassing, we couldn't execute this request. Please try again in a few moments.`
      );
    }
  });

  it(`accepts an undefined 'response' property in the error object`, async () => {
    const client = new HttpClient();
    client.onBeforeRequest = () => {
      // eslint-disable-next-line no-throw-literal
      throw {
        response: undefined,
      };
    };

    try {
      await client.execute();
    } catch (err) {
      expect(err.message).toStrictEqual(
        `This is embarrassing, we couldn't execute this request. Please try again in a few moments.`
      );
    }
  });
});
