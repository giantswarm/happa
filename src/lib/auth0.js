import auth0 from 'auth0-js';

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: 'giantswarm.eu.auth0.com',
    clientID: 'mgYdxCGCZ2eao0OJUGOFXurGIaQAACHs',
    redirectUri: location.protocol + '//' + window.location.host + '/oauth/callback',
    prompt:'none',
    audience: 'g8s',
    responseType: 'id_token',
    scope: 'openid email profile user_metadata https://giantswarm.io',
    connectionScopes: {
      'github': ['read:org']
    }
  });

  constructor() {
    this.login = this.login.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
  }

  login() {
    this.auth0.authorize();
  }

  handleAuthentication(callback) {
    this.auth0.parseHash((err, authResult) => {
      callback(err, authResult);
    });
  }

  renewToken() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('timeout while trying to renew your session');
      }, 10000);

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
