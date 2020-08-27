import { HttpClientImpl } from './HttpClient';

/**
 * The client used to access the Giant Swarm API
 */
export class GiantSwarmClient extends HttpClientImpl {
  /**
   * Create a new Giant Swarm API Client
   * @param authToken - The token used for authorization
   * @param authType - The authorization scheme
   */
  constructor(authToken: string, authType: string) {
    super({
      baseURL: window.config.apiEndpoint,
    });

    this.setHeader('Accept', 'application/json');
    this.setAuthorizationToken(authType, authToken);
  }
}
