import { HttpClient } from './HttpClient';

export class GiantSwarmClient extends HttpClient {
  constructor(authToken) {
    super({
      baseURL: window.config.apiEndpoint,
    });

    this.setAuthorizationToken(authToken);
  }
}
