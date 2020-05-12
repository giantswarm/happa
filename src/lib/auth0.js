import auth0 from 'auth0-js';

export default class Auth {
  static _instance = null;

  auth0 = new auth0.WebAuth({
    domain: 'giantswarm.eu.auth0.com',
    clientID: 'mgYdxCGCZ2eao0OJUGOFXurGIaQAACHs',
    redirectUri: `${location.protocol}//${window.location.host}/oauth/callback`,
    prompt: 'none',
    audience: window.config.apiEndpoint,
    responseType: 'id_token token',
    scope: 'openid email profile user_metadata https://giantswarm.io',
    connectionScopes: {
      github: ['read:org'],
    },
  });

  static getInstance() {
    if (!Auth._instance) {
      Auth._instance = new Auth();
    }

    return Auth._instance;
  }

  login = () => {
    return this.auth0.authorize();
  };

  handleAuthentication = (callback) => {
    this.auth0.parseHash((err, authResult) => {
      callback(err, authResult);
    });
  };

  renewToken() {
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
