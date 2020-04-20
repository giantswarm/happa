import { SelfClient } from '../SelfClient';

describe('SelfClient', () => {
  it('has a correct default configuration', () => {
    const client = new SelfClient();

    expect(client.requestConfig.baseURL).toBe(window.location.origin);
    expect(client.requestConfig.headers).toStrictEqual({
      Accept: 'application/json',
    });
  });
});
