import { IOAuth2Config } from 'lib/OAuth2/OAuth2';
import { AppRoutes } from 'shared/constants/routes';

const authority = window.config.cpAudience;
/**
 * This is derived from the audience because it is verified by the
 * OIDC plugin, and it must be the same as the production, non-proxied
 * authentication provider.
 */
let issuer = authority;
if (issuer.includes('localhost')) {
  issuer = window.config.audience.replace('api', 'dex');
}

export const defaultConfig: IOAuth2Config = {
  authority,
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
  customMetadata: {
    issuer,
    authorizationEndpoint: `${authority}/auth`,
    tokenEndpoint: `${authority}/token`,
    jwksUri: `${authority}/keys`,
    userInfoEndpoint: `${authority}/userinfo`,

    idTokenSigningAlgValuesSupported: ['RS256'],
    tokenEndpointAuthMethodsSupported: ['client_secret_basic'],
    scopesSupported: ['openid', 'email', 'groups', 'profile', 'offline_access'],
    responseTypesSupported: ['code', 'id_token', 'token'],
    subjectTypesSupported: ['public'],
    claimsSupported: [
      'aud',
      'email',
      'email_verified',
      'exp',
      'iat',
      'iss',
      'locale',
      'name',
      'sub',
    ],
  },
};
