/* istanbul ignore file */

import OAuth2 from 'lib/OAuth2/OAuth2';

export enum MapiAuthConnectors {
  Customer = 'customer',
  GiantSwarm = 'giantswarm',
}

class MapiAuth extends OAuth2 {
  public attemptLogin(connector = MapiAuthConnectors.Customer): Promise<void> {
    const authURL = new URL(
      this.userManager.settings.metadata!.authorization_endpoint!
    );
    authURL.searchParams.set('connector_id', connector);

    this.userManager.settings.metadata!.authorization_endpoint = authURL.toString();

    return super.attemptLogin();
  }
}

export default MapiAuth;
