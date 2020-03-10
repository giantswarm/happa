import { HttpClient } from './HttpClient';

/**
 * The client used to access the Giant Swarm API
 * @extends {HttpClient}
 */
export class GiantSwarmClient extends HttpClient {
  /**
   * Create a new Giant Swarm API Client
   * @param {string} authToken - The token used for authorization
   * @param {string} authType - The authorization scheme
   */
  constructor(authToken, authType) {
    super({
      baseURL: window.config.apiEndpoint,
    });

    this.setHeader('Accept', 'application/json');
    this.setAuthorizationToken(authType, authToken);
  }
}
