import Auth from 'lib/auth0';
import * as helpers from 'lib/helpers';
import { IState } from 'reducers/types';
import { selectAuthToken } from 'stores/main/selectors';

// Bypass the user selectors mock.
jest.unmock('stores/main/selectors');

// Mock dispatch.
const dispatchMock = jest.fn();

// Mock SSO.
jest.mock('lib/auth0');
const renewTokenMock = jest.fn();
Auth.getInstance = () =>
  (({
    renewToken: renewTokenMock,
  } as unknown) as Auth);

// Mock helpers
jest.mock('lib/helpers');

// @ts-expect-error
// eslint-disable-next-line no-import-assign
helpers.isJwtExpired = jest.fn();

describe('main::selectors', () => {
  describe('selectAuthToken', () => {
    it('returns the correct auth token if the current one is not expired', async () => {
      (helpers.isJwtExpired as jest.Mock).mockReturnValue(false);

      const state = {
        main: {
          loggedInUser: {
            email: 'developer@giantswarm.io',
            auth: { scheme: 'giantswarm', token: 'a-valid-token' },
            isAdmin: false,
          },
        },
      } as IState;

      const [authToken, scheme] = await selectAuthToken(dispatchMock)(state);

      expect(authToken).toBe('a-valid-token');
      expect(scheme).toBe('giantswarm');
    });

    it('renews the token if the current one is expired and the use is logged in via SSO', async () => {
      (helpers.isJwtExpired as jest.Mock).mockReturnValue(true);
      dispatchMock.mockResolvedValue(true);
      renewTokenMock.mockResolvedValue({
        accessToken: 'new-token',
      });

      const state = {
        main: {
          loggedInUser: {
            email: 'developer@giantswarm.io',
            auth: { scheme: 'Bearer', token: 'an-expired-token' },
            isAdmin: true,
          },
        },
      } as IState;

      const [authToken, scheme] = await selectAuthToken(dispatchMock)(state);

      expect(authToken).toBe('new-token');
      expect(scheme).toBe('Bearer');
    });

    it('throws an error with code 401 if the token renewal fails', async () => {
      (helpers.isJwtExpired as jest.Mock).mockReturnValue(true);
      dispatchMock.mockResolvedValue(true);
      renewTokenMock.mockRejectedValue({
        message: 'Fatal error',
      });

      const state = {
        main: {
          loggedInUser: {
            email: 'developer@giantswarm.io',
            auth: { scheme: 'Bearer', token: 'an-expired-token' },
            isAdmin: true,
          },
        },
      } as IState;

      try {
        await selectAuthToken(dispatchMock)(state);
      } catch (err) {
        expect(err).toStrictEqual({
          status: 401,
          message: 'Fatal error',
        });
      }
    });

    it(`doesn't renew the token if the authentication scheme is 'giantswarm'`, async () => {
      (helpers.isJwtExpired as jest.Mock).mockReturnValue(true);

      const state = {
        main: {
          loggedInUser: {
            email: 'developer@giantswarm.io',
            auth: { scheme: 'giantswarm', token: 'a-non-jwt-token' },
            isAdmin: false,
          },
        },
      } as IState;

      const [authToken, scheme] = await selectAuthToken(dispatchMock)(state);

      expect(authToken).toBe('a-non-jwt-token');
      expect(scheme).toBe('giantswarm');
    });
  });
});
