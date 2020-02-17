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
    return ControlPlaneGateway._instance ?? new ControlPlaneGateway();
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
      baseUrl: window.config.apiEndpoint,
    });
    newClient.setAuthorizationToken(this.authorizationToken);

    return newClient;
  }
}

export default ControlPlaneGateway;

export * from './users';
