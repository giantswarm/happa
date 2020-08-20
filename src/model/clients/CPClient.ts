import { HttpClient } from './HttpClient';

/**
 * The client used to access the Control Plane API.
 */
export class CPClient extends HttpClient {
  /**
   * Create a new Control Plane API client.
   */
  constructor(authToken: string, authType: string) {
    super({
      baseURL: window.config.cpApiEndpoint,
    });

    this.setHeader('Accept', 'application/json');
    this.setAuthorizationToken(authType, authToken);
  }
}

export default CPClient;
