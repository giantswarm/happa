import { HttpClientImpl, IHttpClient } from 'model/clients/HttpClient';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import { getListResource } from '../getListResource';
import * as utils from '../getResource';

const getResource = jest.spyOn(utils, 'getResource');

describe.only('getListResource', () => {
  jest.setTimeout(20000);
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let httpClient: IHttpClient;
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let auth: IOAuth2Provider;
  const url = 'test-url';
  const expectedResult = { items: [] };

  beforeEach(() => {
    httpClient = new HttpClientImpl();
    auth = new TestOAuth2(undefined, true);
    getResource.mockResolvedValue(expectedResult);
  });

  afterEach(() => {
    getResource.mockClear();
  });

  it('should return correct resource', async () => {
    await expect(getListResource(httpClient, auth, url)).resolves.toEqual(
      expectedResult
    );
  });

  it('should retry request when items are undefined', async () => {
    getResource.mockResolvedValueOnce({});
    await expect(getListResource(httpClient, auth, url)).resolves.toEqual(
      expectedResult
    );
    expect(getResource).toHaveBeenCalledTimes(2);
  });

  it('should wait longer before each attempt', async () => {
    const setTimeout = jest.spyOn(global, 'setTimeout');

    getResource.mockResolvedValueOnce({});
    getResource.mockResolvedValueOnce({});
    getResource.mockResolvedValueOnce({});
    getResource.mockResolvedValueOnce({});
    await expect(getListResource(httpClient, auth, url)).resolves.toEqual(
      expectedResult
    );
    expect(getResource).toHaveBeenCalledTimes(5);
    expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 1000);
    expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 2000);
    expect(setTimeout).toHaveBeenNthCalledWith(3, expect.any(Function), 3000);
    expect(setTimeout).toHaveBeenNthCalledWith(4, expect.any(Function), 4000);
  });

  it('should make 5 attempts before failing', async () => {
    getResource.mockResolvedValue({});
    await expect(getListResource(httpClient, auth, url)).rejects.toThrow(
      'getListResource request took too long to complete.'
    );
    expect(getResource).toHaveBeenCalledTimes(5);
  });
});
