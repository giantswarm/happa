import { generateRandomString } from 'testUtils/mockHttpCalls';

import { GiantSwarmClient } from '../GiantSwarmClient';

describe('GiantSwarmClient', () => {
  it('has a correct default configuration', () => {
    // eslint-disable-next-line no-magic-numbers
    const token = generateRandomString(15);
    const client = new GiantSwarmClient(token, 'giantswarm');

    expect(client.getRequestConfig().baseURL).toBe(window.config.apiEndpoint);
    expect(client.getRequestConfig().headers).toStrictEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `giantswarm ${token}`,
    });
  });
});
