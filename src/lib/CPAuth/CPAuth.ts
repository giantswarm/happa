import { getAuthorityURLFromGSApiURL } from 'lib/CPAuth/util';
import OAuth2, { IOAuth2Config } from 'lib/OAuth2/OAuth2';
import { AppRoutes } from 'shared/constants/routes';

const defaultConfig: IOAuth2Config = {
  authority: getAuthorityURLFromGSApiURL(window.config.apiEndpoint),
  clientId: 'zQiFLUnrTFQwrybYzeY53hWWfhOKWRAU',
  clientSecret: 'TVHzVPin2WTiCma6bqp5hdxgKbWZKRbz',
  redirectUri: `${window.location.origin}${AppRoutes.CPAccessCallback}`,
  scope:
    'openid offline_access profile email groups audience:server:client_id:dex-k8s-authenticator',
  responseType: 'code',
  responseMode: 'query',
  prompt: 'none',
  automaticSilentRenew: true,
  includeIDTokenInSilentRenew: true,
  loadUserInfo: true,
  revokeAccessTokenOnLogout: true,
  filterProtocolClaims: true,
  validateSubOnSilentRenew: true,
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
