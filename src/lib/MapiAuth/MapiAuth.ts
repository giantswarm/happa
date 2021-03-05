import { defaultConfig } from 'lib/MapiAuth/config';
import OAuth2 from 'lib/OAuth2/OAuth2';

export enum MapiAuthConnectors {
  Customer = 'customer',
  GiantSwarm = 'giantswarm',
}

class MapiAuth extends OAuth2 {
  private static _instance: MapiAuth | null = null;

  static getInstance(): MapiAuth {
    if (!MapiAuth._instance) {
      MapiAuth._instance = new MapiAuth(defaultConfig);
    }

    return MapiAuth._instance;
  }

  public attemptLogin(connector = MapiAuthConnectors.Customer): Promise<void> {
    const authURL = new URL(
      this.userManager.settings.metadata!.authorization_endpoint!
    );
    authURL.searchParams.append('connector_id', connector);

    this.userManager.settings.metadata!.authorization_endpoint = authURL.toString();

    return super.attemptLogin();
  }
}

export default MapiAuth;
