import { IHttpRequest } from '@airbrake/browser/dist/http_req/api';
import crossFetch from 'cross-fetch';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import { Requester } from 'lib/patchedAirbrakeRequester';
import { AuthorizationTypes } from 'shared/constants';
import configureStore from 'stores/configureStore';
import { LoggedInUserTypes } from 'stores/main/types';
import { IState } from 'stores/state';
import { USER_EMAIL } from 'testUtils/mockHttpCalls';

jest.mock('cross-fetch');

describe('patchedAirbrakeRequester', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws an error if no user is not logged in', async () => {
    const initialState = ({
      main: {
        loggedInUser: null,
      },
    } as unknown) as IState;
    const store = configureStore(
      initialState,
      createMemoryHistory(),
      new TestOAuth2()
    );
    const requester = new Requester(store);

    const req: IHttpRequest = {
      method: 'POST',
      url: 'localhost',
      body: '',
    };
    const promise = requester.request(req);

    await expect(promise).rejects.toThrowError(
      new Error('user is not logged in yet, unable to report error to GS API')
    );
  });

  it('adds the authorization token to the request headers', async () => {
    const initialState = ({
      main: {
        loggedInUser: {
          email: USER_EMAIL,
          auth: {
            scheme: AuthorizationTypes.GS,
            token: 'some-token',
          },
          isAdmin: false,
          type: LoggedInUserTypes.GS,
        },
      },
    } as unknown) as IState;
    const store = configureStore(
      initialState,
      createMemoryHistory(),
      new TestOAuth2()
    );
    const requester = new Requester(store);

    const res = {
      status: 201,
    } as Response;
    (crossFetch as jest.Mock).mockResolvedValueOnce(res);

    const req: IHttpRequest = {
      method: 'POST',
      url: 'localhost',
      body: '',
    };
    const result = await requester.request(req);
    expect(result).toStrictEqual({ json: null });

    expect(crossFetch).toHaveBeenCalledWith(req.url, {
      method: req.method,
      body: req.body,
      headers: {
        Authorization: 'giantswarm some-token',
      },
    });
  });

  it('returns the response message in an error if the request returns an error', async () => {
    const initialState = ({
      main: {
        loggedInUser: {
          email: USER_EMAIL,
          auth: {
            scheme: AuthorizationTypes.GS,
            token: 'some-token',
          },
          type: LoggedInUserTypes.GS,
          isAdmin: false,
        },
      },
    } as unknown) as IState;
    const store = configureStore(
      initialState,
      createMemoryHistory(),
      new TestOAuth2()
    );
    const requester = new Requester(store);

    const res = {
      status: 400,
      text() {
        return Promise.resolve('Some terrible error!');
      },
    } as Response;
    (crossFetch as jest.Mock).mockResolvedValueOnce(res);

    const req: IHttpRequest = {
      method: 'POST',
      url: 'localhost',
      body: '',
    };
    const resultPromise = requester.request(req);
    await expect(resultPromise).rejects.toThrowError(
      new Error(
        `airbrake: fetch: unexpected response: code=${res.status} body='Some terrible error!'`
      )
    );

    expect(crossFetch).toHaveBeenCalledWith(req.url, {
      method: req.method,
      body: req.body,
      headers: {
        Authorization: 'giantswarm some-token',
      },
    });
  });
});
