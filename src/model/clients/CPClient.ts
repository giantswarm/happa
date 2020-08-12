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
    const baseURL = CPClient.getBaseURLFromAPIURL(window.config.apiEndpoint);

    super({
      baseURL,
    });

    this.setHeader('Accept', 'application/json');
    this.setAuthorizationToken(authType, authToken);
  }

  private static getBaseURLFromAPIURL(apiURL: string): string {
    return apiURL.replace('api', 'proxy');
  }
}

export default CPClient;
