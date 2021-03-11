/* istanbul ignore file */

import { OidcMetadata } from 'oidc-client';

export interface IOAuth2CustomMetadata {
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  jwksUri: string;
  userInfoEndpoint: string;
  endSessionEndpoint: string;

  idTokenSigningAlgValuesSupported: string[];
  tokenEndpointAuthMethodsSupported: string[];
  scopesSupported: string[];
  responseTypesSupported: string[];
  subjectTypesSupported: string[];
  claimsSupported: string[];
}

export function convertToOIDCMetadata(
  metadata?: Partial<IOAuth2CustomMetadata>
): Partial<OidcMetadata> | undefined {
  if (!metadata) return undefined;

  return {
    issuer: metadata.issuer,
    authorization_endpoint: metadata.authorizationEndpoint,
    token_endpoint: metadata.tokenEndpoint,
    jwks_uri: metadata.jwksUri,
    userinfo_endpoint: metadata.userInfoEndpoint,
    end_session_endpoint: metadata.endSessionEndpoint,

    id_token_signing_alg_values_supported:
      metadata.idTokenSigningAlgValuesSupported,
    token_endpoint_auth_methods_supported:
      metadata.tokenEndpointAuthMethodsSupported,
    scopes_supported: metadata.scopesSupported,
    response_types_supported: metadata.responseTypesSupported,
    subject_types_supported: metadata.subjectTypesSupported,
    claims_supported: metadata.claimsSupported,
  };
}
