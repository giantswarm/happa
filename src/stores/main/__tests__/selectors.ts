import Auth from 'lib/auth0';
import * as helpers from 'lib/helpers';
import { getK8sVersionEOLDate, selectAuthToken } from 'stores/main/selectors';
import { IState } from 'stores/state';

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

    it('throws an error if the user is not logged in', async () => {
      const state = {
        main: {
          loggedInUser: null,
        },
      } as IState;

      const promise = selectAuthToken(dispatchMock)(state);
      await expect(promise).rejects.toThrowError(/you are not logged in/i);
    });
  });

  describe('getK8sVersionEOLDate', () => {
    function getStateWithK8sVersions(
      versions?: IInstallationInfoKubernetesVersion[]
    ) {
      return ({
        main: {
          info: {
            general: {
              kubernetes_versions: versions,
            },
          },
        },
      } as unknown) as IState;
    }

    it('retrieves the correct version information for a given version number', () => {
      const state = getStateWithK8sVersions([
        {
          minor_version: '1.00',
          eol_date: '1960-05-20',
        },
        {
          minor_version: '1.01',
          eol_date: '2010-05-20',
        },
        {
          minor_version: '2.00',
          eol_date: '2999-01-12',
        },
      ]);

      expect(getK8sVersionEOLDate('1.01.24')(state)).toBe('2010-05-20');
    });

    it('returns null if the version is an empty string', () => {
      const state = getStateWithK8sVersions([
        {
          minor_version: '1.00',
          eol_date: '1960-05-20',
        },
        {
          minor_version: '1.01',
          eol_date: '2010-05-20',
        },
        {
          minor_version: '2.00',
          eol_date: '2999-01-12',
        },
      ]);

      expect(getK8sVersionEOLDate('')(state)).toBeNull();
    });

    it('returns null if there is no information about versions in the store', () => {
      const state = getStateWithK8sVersions();

      expect(getK8sVersionEOLDate('')(state)).toBeNull();
    });

    it('returns null if the given version number is not a valid semver version', () => {
      const state = getStateWithK8sVersions([
        {
          minor_version: '1.00',
          eol_date: '1960-05-20',
        },
        {
          minor_version: '1.01',
          eol_date: '2010-05-20',
        },
        {
          minor_version: '2.00',
          eol_date: '2999-01-12',
        },
      ]);

      expect(getK8sVersionEOLDate('1')(state)).toBeNull();
    });

    it('returns null if there is no information available about the given version', () => {
      const state = getStateWithK8sVersions([
        {
          minor_version: '1.00',
          eol_date: '1960-05-20',
        },
        {
          minor_version: '1.01',
          eol_date: '2010-05-20',
        },
        {
          minor_version: '2.00',
          eol_date: '2999-01-12',
        },
      ]);

      expect(getK8sVersionEOLDate('3.0.0')(state)).toBeNull();
    });
  });
});
