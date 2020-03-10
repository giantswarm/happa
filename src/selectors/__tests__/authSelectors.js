import Auth from 'lib/auth0';
import * as helpers from 'lib/helpers';

// Bypass the authSelectors mock
jest.unmock('selectors/authSelectors');
const { selectAuthToken } = jest.requireActual('selectors/authSelectors');

// Mock dispatch
const dispatchMock = jest.fn();

// Mock SSO
jest.mock('lib/auth0');
const renewTokenMock = jest.fn();
Auth.getInstance = () => ({
  renewToken: renewTokenMock,
});

// Mock helpers
jest.mock('lib/helpers');

// eslint-disable-next-line no-import-assign
helpers.isJwtExpired = jest.fn();

describe('authSelectors', () => {
  describe('selectAuthToken', () => {
    it('returns the correct auth token if the current one is not expired', async () => {
      helpers.isJwtExpired.mockReturnValue(false);

      const state = {
        app: {
          loggedInUser: {
            email: 'developer@giantswarm.io',
            auth: { scheme: 'giantswarm', token: 'a-valid-token' },
            isAdmin: false,
          },
        },
      };

      const [authToken, scheme] = await selectAuthToken(dispatchMock, state);

      expect(authToken).toBe('a-valid-token');
      expect(scheme).toBe('giantswarm');
    });

    it('renews the token if the current one is expired and the use is logged in via SSO', async () => {
      helpers.isJwtExpired.mockReturnValue(true);
      dispatchMock.mockResolvedValue(true);
      renewTokenMock.mockResolvedValue({
        accessToken: 'new-token',
      });

      const state = {
        app: {
          loggedInUser: {
            email: 'developer@giantswarm.io',
            auth: { scheme: 'Bearer', token: 'an-expired-token' },
            isAdmin: true,
          },
        },
      };

      const [authToken, scheme] = await selectAuthToken(dispatchMock, state);

      expect(authToken).toBe('new-token');
      expect(scheme).toBe('Bearer');
    });

    it('throws an error with code 401 if the token renewal fails', async () => {
      helpers.isJwtExpired.mockReturnValue(true);
      dispatchMock.mockResolvedValue(true);
      renewTokenMock.mockRejectedValue({
        message: 'Fatal error',
      });

      const state = {
        app: {
          loggedInUser: {
            email: 'developer@giantswarm.io',
            auth: { scheme: 'Bearer', token: 'an-expired-token' },
            isAdmin: true,
          },
        },
      };

      try {
        await selectAuthToken(dispatchMock, state);
      } catch (err) {
        expect(err).toStrictEqual({
          status: 401,
          message: 'Fatal error',
        });
      }
    });

    it(`doesn't renew the token if the authentication scheme is 'giantswarm'`, async () => {
      helpers.isJwtExpired.mockReturnValue(true);

      const state = {
        app: {
          loggedInUser: {
            email: 'developer@giantswarm.io',
            auth: { scheme: 'giantswarm', token: 'a-non-jwt-token' },
            isAdmin: false,
          },
        },
      };

      const [authToken, scheme] = await selectAuthToken(dispatchMock, state);

      expect(authToken).toBe('a-non-jwt-token');
      expect(scheme).toBe('giantswarm');
    });
  });
});
