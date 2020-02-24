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
      ControlPlaneGateway._instance = new ControlPlaneGateway();
    }

    return ControlPlaneGateway._instance;
  }

  authorizationToken = null;

  setAuthorizationToken(token) {
    this.authorizationToken = token;
  }

  /**
   * @returns {HttpClient}
   */
  getClient() {
    const newClient = new HttpClient({
      baseURL: window.config.apiEndpoint,
    });
    newClient.setAuthorizationToken(this.authorizationToken);

    return newClient;
  }
}

export default ControlPlaneGateway;

export * from './info';
