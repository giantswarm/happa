import { SelfClient } from '../SelfClient';

describe('SelfClient', () => {
  it('has a correct default configuration', () => {
    const client = new SelfClient();

    expect(client.getRequestConfig().baseURL).toBe(window.location.origin);
    expect(client.getRequestConfig().headers).toStrictEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  });
});
