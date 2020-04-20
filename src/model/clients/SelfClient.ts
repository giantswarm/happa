import { HttpClient } from './HttpClient';

/**
 * The client used to access the application
 */
export class SelfClient extends HttpClient {
  /**
   * Create a new self-accessing app client
   */
  constructor() {
    super({
      baseURL: window.location.origin,
    });

    this.setHeader('Accept', 'application/json');
  }
}
