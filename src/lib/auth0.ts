import createAuth0Client, { Auth0Client } from '@auth0/auth0-spa-js';

const renewTimeout = 10000;

export interface IAuthResult {
  accessToken: string;
  idTokenPayload: IIDTokenPayload;
}

export interface IIDTokenPayload {
  email: string;
  'https://giantswarm.io/groups': string;
}

class Auth {
  private static _instance: Auth | null = null;

  public static getInstance() {
    if (!Auth._instance) {
      Auth._instance = new Auth();
    }

    return Auth._instance;
  }

  public auth0: Auth0Client | null = null;

  public async init() {
    if (this.auth0 === null) {
      this.auth0 = await createAuth0Client({
        domain: 'giantswarm.eu.auth0.com',
        client_id: 'mgYdxCGCZ2eao0OJUGOFXurGIaQAACHs',
        redirect_uri: `${location.protocol}//${window.location.host}/oauth/callback`,
        useRefreshTokens: true,
        audience: window.config.audience,
        scope: 'openid email profile user_metadata https://giantswarm.io',
      });
    }

    return this.auth0;
  }

  public login() {
    if (this.auth0) {
      this.auth0.loginWithRedirect();
    } else {
      throw new Error(`can't login, auth0 not initialized yet`);
    }
  }

  public async handleAuthentication(
    callback: (
      err: { errorDescription: string } | null,
      authResult: IAuthResult | null
    ) => void
  ) {
    if (this.auth0) {
      try {
        await this.auth0.handleRedirectCallback();
        const idToken = await this.auth0.getIdTokenClaims();
        const accessToken = await this.auth0.getTokenSilently({
          audience: window.config.audience,
          scope: 'openid email profile user_metadata https://giantswarm.io',
        });

        callback(null, {
          idTokenPayload: (idToken as unknown) as IIDTokenPayload,
          accessToken: accessToken,
        });
      } catch (e) {
        callback(
          {
            errorDescription: `Something went wrong while trying to authenticate: ${e}`,
          },
          null
        );
      }
    } else {
      callback(
        { errorDescription: `can't login, auth0 not initialized yet` },
        null
      );
    }
  }

  public renewToken(): Promise<IAuthResult> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('timeout while trying to renew your session'));
      }, renewTimeout);

      if (this.auth0) {
        const auth0 = this.auth0;

        (async () => {
          const idToken = await auth0.getIdTokenClaims();
          const accessToken = await auth0.getTokenSilently({
            audience: window.config.audience,
            scope: 'openid email profile user_metadata https://giantswarm.io',
          });

          resolve({
            idTokenPayload: (idToken as unknown) as IIDTokenPayload,
            accessToken: accessToken,
          });
        })();
      }
    });
  }
}

Auth.getInstance().init();

export default Auth;
