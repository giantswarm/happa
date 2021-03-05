import { LoggedInUserTypes } from 'stores/main/types';
import { fetchUserFromStorage } from 'utils/localStorageUtils';

describe('localStorageUtils', () => {
  afterEach(() => {
    localStorage.removeItem('user');
  });

  describe('fetchUserFromStorage', () => {
    it('retrieves the user from storage', () => {
      const user: ILoggedInUser = {
        auth: {
          scheme: 'giantswarm',
          token: '',
        },
        email: '',
        isAdmin: false,
        type: LoggedInUserTypes.GS,
      };
      localStorage.setItem('user', JSON.stringify(user));

      expect(fetchUserFromStorage()).toStrictEqual(user);
    });

    it(`returns 'null' if the user cannot be parsed`, () => {
      localStorage.setItem('user', 'I want to be JSON when I grow up');
      expect(fetchUserFromStorage()).toBeNull();
    });

    it('migrates user logged in before introducing JWT tokens', () => {
      const user: ILoggedInUser = {
        auth: {
          scheme: 'giantswarm',
          token: '',
        },
        email: '',
        isAdmin: false,
        authToken: '123',
        type: LoggedInUserTypes.GS,
      };
      localStorage.setItem('user', JSON.stringify(user));

      expect(fetchUserFromStorage()).toStrictEqual({
        auth: {
          scheme: 'giantswarm',
          token: '123',
        },
        email: '',
        isAdmin: false,
        authToken: '123',
        type: LoggedInUserTypes.GS,
      });
    });

    it('migrates user logged in before introducing token types', () => {
      const user: Partial<ILoggedInUser> = {
        auth: {
          scheme: 'giantswarm',
          token: '',
        },
        email: '',
        isAdmin: false,
        authToken: '123',
      };
      localStorage.setItem('user', JSON.stringify(user));

      expect(fetchUserFromStorage()).toStrictEqual({
        auth: {
          scheme: 'giantswarm',
          token: '123',
        },
        email: '',
        isAdmin: false,
        authToken: '123',
        type: LoggedInUserTypes.GS,
      });
    });

    it('does not deserialize user logged in via Auth0', () => {
      const user: Partial<ILoggedInUser> = {
        auth: {
          scheme: 'Bearer',
          token: '',
        },
        email: '',
        isAdmin: false,
        authToken: '123',
      };
      localStorage.setItem('user', JSON.stringify(user));

      expect(fetchUserFromStorage()).toBeNull();
    });
  });
});
