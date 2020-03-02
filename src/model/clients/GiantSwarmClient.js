import { HttpClient } from './HttpClient';

export class GiantSwarmClient extends HttpClient {
  constructor(authToken, authType) {
    super({
      baseURL: window.config.apiEndpoint,
    });

    this.setHeader('Accept', 'application/json');
    this.setAuthorizationToken(authType, authToken);
  }
}
