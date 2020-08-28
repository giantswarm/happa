import auth0, { Auth0DecodedHash, Auth0Error } from 'auth0-js';

export interface IAuthResult {
  accessToken: string;
  idTokenPayload: {
    email: string;
    'https://giantswarm.io/groups': string;
  };
}

class Auth {
  private static _instance: Auth | null = null;

  public static getInstance() {
    if (!Auth._instance) {
      Auth._instance = new Auth();
    }

    return Auth._instance;
  }

  private auth0 = new auth0.WebAuth({
    domain: 'giantswarm.eu.auth0.com',
    clientID: 'mgYdxCGCZ2eao0OJUGOFXurGIaQAACHs',
    redirectUri: `${location.protocol}//${window.location.host}/oauth/callback`,
    audience: window.config.audience,
    responseType: 'id_token token',
    scope: 'openid email profile user_metadata https://giantswarm.io',
  });

  public login() {
    return this.auth0.authorize({
      prompt: 'none',
    });
  }

  public handleAuthentication(
    callback: (
      err: Auth0Error | null,
      authResult: Auth0DecodedHash | null
    ) => void
  ) {
    this.auth0.parseHash((err, authResult) => {
      callback(err, authResult);
    });
  }

  public renewToken(): Promise<IAuthResult> {
    return new Promise((resolve, reject) => {
      const renewTimeout = 10000;

      setTimeout(() => {
        reject(new Error('timeout while trying to renew your session'));
      }, renewTimeout);

      this.auth0.checkSession({}, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    });
  }
}

export default Auth;
