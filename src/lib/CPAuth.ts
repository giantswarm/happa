import OAuth2, { IOAuth2Config } from 'lib/OAuth2/OAuth2';
import { AppRoutes } from 'shared/constants/routes';

const defaultConfig: IOAuth2Config = {
  authority: 'https://dex.g8s.ginger.eu-west-1.aws.gigantic.io',
  clientId: 'zQiFLUnrTFQwrybYzeY53hWWfhOKWRAU',
  clientSecret: 'TVHzVPin2WTiCma6bqp5hdxgKbWZKRbz',
  redirectUri: `${window.location.origin}${AppRoutes.CPAccessCallback}`,
  scope:
    'openid profile email groups offline_access audience:server:client_id:dex-k8s-authenticator',
  responseType: 'id_token',
  prompt: 'none',
};

class CPAuth extends OAuth2 {
  private static _instance: CPAuth | null = null;

  static getInstance(): CPAuth {
    if (!CPAuth._instance) {
      CPAuth._instance = new CPAuth(defaultConfig);
    }

    return CPAuth._instance;
  }
}

export default CPAuth;
