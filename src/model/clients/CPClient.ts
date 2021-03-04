import { HttpClientImpl } from './HttpClient';

/**
 * The client used to access the Control Plane API.
 */
export class CPClient extends HttpClientImpl {
  /**
   * Create a new Control Plane API client.
   */
  constructor(authToken: string, authType: string) {
    super({
      baseURL: window.config.mapiEndpoint,
    });

    this.setHeader('Accept', 'application/json');
    this.setAuthorizationToken(authType, authToken);
  }
}

export default CPClient;
