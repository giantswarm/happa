/* istanbul ignore file */

import OAuth2 from 'utils/OAuth2/OAuth2';

export enum MapiAuthConnectorFilters {
  Customer = 'customer',
  GiantSwarm = 'giantswarm',
}

class MapiAuth extends OAuth2 {
  public attemptLogin(
    connector = MapiAuthConnectorFilters.Customer
  ): Promise<void> {
    const authURL = new URL(
      this.userManager.settings.metadata!.authorization_endpoint!
    );
    authURL.searchParams.set('connector_filter', connector);

    this.userManager.settings.metadata!.authorization_endpoint =
      authURL.toString();

    return super.attemptLogin();
  }
}

export default MapiAuth;
