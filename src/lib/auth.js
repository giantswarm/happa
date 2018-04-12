import auth0 from 'auth0-js';

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: 'giantswarm.eu.auth0.com',
    clientID: 'mgYdxCGCZ2eao0OJUGOFXurGIaQAACHs',
    redirectUri: 'http://localhost:7000/oauth/callback',
    audience: 'g8s',
    responseType: 'token id_token',
    scope: 'openid email user_metadata',
    connectionScopes: {
      'github': ['read:org']
    }
  });

  login() {
    this.auth0.authorize();
  }
}
