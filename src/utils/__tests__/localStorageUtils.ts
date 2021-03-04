import { LoggedInUserTypes } from 'stores/main/utils';
import { fetchUserFromStorage } from 'utils/localStorageUtils';

describe('localStorageUtils', () => {
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
      localStorage.removeItem('user');
    });

    it(`returns 'null' if the user cannot be parsed`, () => {
      localStorage.setItem('user', 'I want to be JSON when I grow up');
      expect(fetchUserFromStorage()).toBeNull();

      localStorage.removeItem('user');
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
      localStorage.removeItem('user');
    });
  });
});
