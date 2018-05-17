import auth0 from 'auth0-js';

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: 'giantswarm.eu.auth0.com',
    clientID: 'mgYdxCGCZ2eao0OJUGOFXurGIaQAACHs',
    redirectUri: 'http://localhost:7000/oauth/callback',
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
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
  }

  login() {
    this.auth0.authorize();
  }

  logout() {
    // Clear Access Token and ID Token from local storage
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
  }

  handleAuthentication(callback) {
    this.auth0.parseHash((err, authResult) => {
      callback(err, authResult);
    });
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // Access Token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  renewToken() {
    this.auth0.checkSession({}, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          this.setSession(result);
        }
      }
    );
  }
}
