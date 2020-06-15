import { getAuthorityURLFromGSApiURL } from 'lib/CPAuth/util';
import { IOAuth2Config } from 'lib/OAuth2/OAuth2';
import { AppRoutes } from 'shared/constants/routes';

const authority = getAuthorityURLFromGSApiURL(window.config.apiEndpoint);

export const defaultConfig: IOAuth2Config = {
  authority: authority,
  clientId: 'fFlz7lckhWA0kIaW3fLIl8chFSs2wvW6',
  clientSecret:
    'PoioOqWKUndxVnbcRzlv59EgvwPVJQIdIlved143Uko0SjGJ7OprnecZQbab3WhH',
  redirectUri: `${window.location.origin}${AppRoutes.CPAccessCallback}`,
  scope:
    'openid offline_access profile email groups audience:server:client_id:dex-k8s-authenticator',
  responseType: 'code',
  responseMode: 'query',
  prompt: 'none',
  automaticSilentRenew: true,
  includeIDTokenInSilentRenew: true,
  loadUserInfo: false,
  revokeAccessTokenOnLogout: true,
  filterProtocolClaims: true,
  validateSubOnSilentRenew: true,
  persistenceMethod: localStorage,
};
