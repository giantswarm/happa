import { defaultConfig } from 'lib/MapiAuth/config';
import OAuth2 from 'lib/OAuth2/OAuth2';

class MapiAuth extends OAuth2 {
  private static _instance: MapiAuth | null = null;

  static getInstance(): MapiAuth {
    if (!MapiAuth._instance) {
      MapiAuth._instance = new MapiAuth(defaultConfig);
    }

    return MapiAuth._instance;
  }
}

export default MapiAuth;
