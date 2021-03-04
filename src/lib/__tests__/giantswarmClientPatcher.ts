import GiantSwarm from 'giantswarm';
import { createMemoryHistory } from 'history';
import Auth from 'lib/auth0';
import monkeyPatchGiantSwarmClient from 'lib/giantswarmClientPatcher';
import { isJwtExpired } from 'lib/helpers';
import MapiAuth from 'lib/MapiAuth/MapiAuth';
import configureStore from 'stores/configureStore';
import { IState } from 'stores/state';
import { USER_EMAIL } from 'testUtils/mockHttpCalls';

jest.mock('lib/helpers');
jest.mock('lib/auth0');
jest.mock('giantswarm');

describe('giantswarmClientPatcher', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('patches the GS client to renew the JWT token before any request, if it is expired', async () => {
    const callApiMock = jest.fn();
    const GsClient = function (this: GiantSwarm.ApiClient) {
      this.authentications = {
        AuthorizationHeaderToken: {
          type: 'oauth2' as const,
          name: '',
          apiKeyPrefix: 'Bearer',
          apiKey: 'testing123key',
        },
      };
      this.callApi = callApiMock;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gsClient = new (GsClient as any)();
    makeGSClientMock(gsClient);

    const auther = {
      renewToken: jest.fn().mockResolvedValueOnce({
        accessToken: 'some-new-token',
        idTokenPayload: {
          email: USER_EMAIL,
          'https://giantswarm.io/groups': 'api-admin',
        },
      }),
    };
    makeAutherMock(auther);

    (isJwtExpired as jest.Mock).mockImplementation(() => true);

    const store = configureStore(
      {} as IState,
      createMemoryHistory(),
      MapiAuth.getInstance()
    );
    monkeyPatchGiantSwarmClient(store);

    await gsClient.callApi('test', 'GET', {}, {}, {}, {}, {}, [], [], [], {});
    expect(callApiMock).toHaveBeenCalledWith(
      'test',
      'GET',
      {},
      {},
      { Authorization: 'Bearer some-new-token' },
      {},
      {},
      [],
      [],
      [],
      {}
    );
  });

  it('skips patching the GS client to renew the JWT token before any request, if it is not expired', async () => {
    const callApiMock = jest.fn();
    const GsClient = function (this: GiantSwarm.ApiClient) {
      this.authentications = {
        AuthorizationHeaderToken: {
          type: 'oauth2' as const,
          name: '',
          apiKeyPrefix: 'Bearer',
          apiKey: 'testing123key',
        },
      };
      this.callApi = callApiMock;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gsClient = new (GsClient as any)();
    makeGSClientMock(gsClient);

    const auther = {
      renewToken: jest.fn().mockResolvedValueOnce({
        accessToken: 'some-new-token',
        idTokenPayload: {
          email: USER_EMAIL,
          'https://giantswarm.io/groups': 'api-admin',
        },
      }),
    };
    makeAutherMock(auther);

    (isJwtExpired as jest.Mock).mockImplementation(() => false);

    const store = configureStore(
      {} as IState,
      createMemoryHistory(),
      MapiAuth.getInstance()
    );
    monkeyPatchGiantSwarmClient(store);

    await gsClient.callApi('test', 'GET', {}, {}, {}, {}, {}, [], [], [], {});
    expect(callApiMock).toHaveBeenCalledWith(
      'test',
      'GET',
      {},
      {},
      {},
      {},
      {},
      [],
      [],
      [],
      {}
    );
  });

  it('skips patching the GS client to renew the JWT token before any request, if it is not a Bearer token', async () => {
    const callApiMock = jest.fn();
    const GsClient = function (this: GiantSwarm.ApiClient) {
      this.authentications = {
        AuthorizationHeaderToken: {
          type: 'oauth2' as const,
          name: '',
          apiKeyPrefix: 'giantswarm',
          apiKey: 'testing123key',
        },
      };
      this.callApi = callApiMock;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gsClient = new (GsClient as any)();
    makeGSClientMock(gsClient);

    const auther = {
      renewToken: jest.fn().mockResolvedValueOnce({
        accessToken: 'some-new-token',
        idTokenPayload: {
          email: USER_EMAIL,
          'https://giantswarm.io/groups': 'api-admin',
        },
      }),
    };
    makeAutherMock(auther);

    (isJwtExpired as jest.Mock).mockImplementation(() => true);

    const store = configureStore(
      {} as IState,
      createMemoryHistory(),
      MapiAuth.getInstance()
    );
    monkeyPatchGiantSwarmClient(store);

    await gsClient.callApi('test', 'GET', {}, {}, {}, {}, {}, [], [], [], {});
    expect(callApiMock).toHaveBeenCalledWith(
      'test',
      'GET',
      {},
      {},
      {},
      {},
      {},
      [],
      [],
      [],
      {}
    );
  });

  it('throws an error status code 401 if renewal fails', () => {
    const callApiMock = jest.fn();
    const GsClient = function (this: GiantSwarm.ApiClient) {
      this.authentications = {
        AuthorizationHeaderToken: {
          type: 'oauth2' as const,
          name: '',
          apiKeyPrefix: 'Bearer',
          apiKey: 'testing123key',
        },
      };
      this.callApi = callApiMock;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gsClient = new (GsClient as any)();
    makeGSClientMock(gsClient);

    const auther = {
      renewToken: jest.fn().mockRejectedValueOnce({
        message: 'some error occured',
      }),
    };
    makeAutherMock(auther);

    (isJwtExpired as jest.Mock).mockImplementation(() => true);

    const store = configureStore(
      {} as IState,
      createMemoryHistory(),
      MapiAuth.getInstance()
    );
    monkeyPatchGiantSwarmClient(store);

    const promise = gsClient.callApi(
      'test',
      'GET',
      {},
      {},
      {},
      {},
      {},
      [],
      [],
      [],
      {}
    );
    expect(promise).rejects.toStrictEqual({
      message: 'some error occured',
      status: 401,
    });
  });
});

function makeAutherMock(auther: Partial<Auth>) {
  Auth.getInstance = () => auther as Auth;
}

function makeGSClientMock(client: Partial<GiantSwarm.ApiClient>) {
  // @ts-expect-error
  GiantSwarm.ApiClient.instance = client;
}
