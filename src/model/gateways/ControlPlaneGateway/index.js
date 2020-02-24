import Auth0 from 'lib/auth0';
import { isJwtExpired } from 'lib/helpers';
import HttpClient from 'model/clients/HttpClient';

class ControlPlaneGateway {
  /**
   * @private
   */
  static _instance = null;

  /**
   * @returns {ControlPlaneGateway}
   */
  static getInstance() {
    if (!ControlPlaneGateway._instance) {
      ControlPlaneGateway._instance = new ControlPlaneGateway(new Auth0());
    }

    return ControlPlaneGateway._instance;
  }

  constructor(ssoProvider) {
    this.ssoProvider = ssoProvider;
  }

  ssoProvider = null;
  authorizationToken = null;

  setAuthToken(token) {
    this.authorizationToken = token;
  }

  renewAuthIfExpired = async () => {
    try {
      if (isJwtExpired(this.authorizationToken)) {
        const newAuthData = await this.ssoProvider.renewToken();
        this.onAuthRenew(newAuthData);
      }
    } catch (err) {
      const newErr = Object.assign({}, err, { status: 401 });

      throw newErr;
    }
  };

  // eslint-disable-next-line no-unused-vars,class-methods-use-this, no-empty-function
  async onAuthRenew(newAuth) {}

  /**
   * @returns {HttpClient}
   */
  getClient() {
    const newClient = new HttpClient({
      baseURL: window.config.apiEndpoint,
    });
    newClient.onBeforeRequest = this.renewAuthIfExpired;
    newClient.setAuthorizationToken(this.authorizationToken);

    return newClient;
  }
}

export default ControlPlaneGateway;

export * from './info';
