import { HttpClient } from './HttpClient';

/**
 * The client used to access the Control Plane API.
 */
export class CPClient extends HttpClient {
  /**
   * Create a new Control Plane API client.
   */
  constructor(authToken: string, authType: string) {
    // Get the base Control Plane API URL from the GS API URL.
    const baseURL = window.config.apiEndpoint.replace('api.', '');

    super({
      baseURL,
    });

    this.setHeader('Accept', 'application/json');
    this.setAuthorizationToken(authType, authToken);
  }
}

export default CPClient;
