import Auth from 'lib/auth0';

describe('Auth', () => {
  describe('getInstance', () => {
    it('is a singleton', () => {
      const auth = Auth.getInstance();
      expect(Auth.getInstance()).toBe(auth);
    });
  });

  describe('renewToken', () => {
    it('times out if the renewal takes more than 10s', async () => {
      jest.useFakeTimers();

      const auther = Auth.getInstance();
      // @ts-expect-error
      auther.auth0 = {
        getIdTokenClaims: jest.fn(),
      };
      // @ts-expect-error
      (auther.auth0.getIdTokenClaims as jest.Mock).mockImplementation(() => {
        return new Promise((resolve) => {
          // eslint-disable-next-line no-magic-numbers
          setTimeout(resolve, 50000);
        });
      });

      const promise = auther.renewToken();
      // eslint-disable-next-line no-magic-numbers
      jest.advanceTimersByTime(10000);
      await expect(promise).rejects.toThrowError(
        new Error('timeout while trying to renew your session')
      );
    });
  });
});
