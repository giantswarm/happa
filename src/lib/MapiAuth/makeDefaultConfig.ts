import { IOAuth2Config } from 'lib/OAuth2/OAuth2';

export function makeDefaultConfig(): IOAuth2Config {
  let authority = window.config.mapiAudience;
  if (!/http(s)?:\/\//.test(authority)) {
    authority = `https://${authority}`;
  }
  /**
   * This is derived from the audience because it is verified by the
   * OIDC plugin, and it must be the same as the production, non-proxied
   * authentication provider.
   */
  let issuer = authority;
  if (issuer.includes('localhost')) {
    issuer = window.config.audience.replace('api', 'dex');
  }

  return {
    authority,
    clientId: 'fFlz7lckhWA0kIaW3fLIl8chFSs2wvW6',
    clientSecret:
      'PoioOqWKUndxVnbcRzlv59EgvwPVJQIdIlved143Uko0SjGJ7OprnecZQbab3WhH',
    redirectUri: window.config.mapiAuthRedirectURL,
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
      scopesSupported: [
        'openid',
        'email',
        'groups',
        'profile',
        'offline_access',
      ],
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
    signingKeys: [
      {
        use: 'sig',
        kty: 'RSA',
        kid: 'c4b753955fa035d8330f4f0006bc3597eed8c8a4',
        alg: 'RS256',
        n:
          'qGQ5N7y5Ktsv2HPJInCLE2DuZ1QHIwdSJmQw_xJfDogn6Plfjteyohlt5fkb4V30WmL3rfjJujW8NU7-80IPlXt5xksF9pN42pFpWIfCvXNbSiX9HJ0pyaX6EUBWvJcPI98pCMASw423HvFVRFibtD1iiqjWPVks4TOvjRTzwqYEo1gGOzuh9dmjxcTKnC1SF0BQoa6NSaPCSVIQsfu5y9pT7-7VqTP8aA2up6jbSR3wvoFK0TGQ_Cr4ln8QslK4-M2q66cuyfHe3l4Jpz9aoDxtpCt-Oid9gv_oTMUdPE_QV1hvGERV4X7nNsvjiXndi9go5uHmUbix-Sb40cWPaw',
        e: 'AQAB',
      },
      {
        use: 'sig',
        kty: 'RSA',
        kid: '059098b58ceb4c6c096a1f0a16601cbe64cb7017',
        alg: 'RS256',
        n:
          '3IL66cfUl4cCTsGW6V0x6_keH4PDLFTB97EFLrnDclxZKGCaq-iK4W5hMVSPvF1btNxYpraryNYVVvMJ1jHJLcISevYeO8TV1QpGXubCCaq-P5nJKis77E0mUZouiyeW5QU8BPPXsAGgzCPdox3zf_UbMM1m31Jq1oubpgGWJJLLwBKx6Gk0pLvEbr-dcYSXzneh4Oefe2YawdlP7Q_u1Htm1P5eozBosrfmLsbKzNbbnSske-cy_JKwUNKTPLPTR6Zj_cF8WepbWHW5VgzCI7iBjI_qo7dhfOFFyV6WK7vJ4Y0hf3-yuMHPPzLBJZUCJNAOo_jcU2QwqAuDQoIC5w',
        e: 'AQAB',
      },
      {
        use: 'sig',
        kty: 'RSA',
        kid: '2c617d049931fe7fc98416b00d04c99c35085ded',
        alg: 'RS256',
        n:
          '2d5As8ovm9NH4P4i0-A-38ih6jbkR0Gh28tjtP0jKQf4OJnhyw1LeGhq3ke-gjHtlWWljOGRKOvnC9dE325E6cIAeKwBHIgSpSh1aViRBmYksIlxzt0rR_jwnPC68jJUNwb40FhgJtpNo8Xzkb89IOnsZREphai72h1cxUIZ95XNSKnOOHlI7De0CgyEZxhxnU4sJC4P5Jj3TGY-ewgZKNqehTwY0qdk2OoNM_MxId1J5hwJiju3aM4k2eu7Y4DwirMQTRnp0jsu2K3-1GphOjSD2fXFWRaXK7J1BHUURIysG2ukVv6_NqulDrOS_uKXRm8bKBXpd2JkcvPQWZ7Pmw',
        e: 'AQAB',
      },
      {
        use: 'sig',
        kty: 'RSA',
        kid: 'f54597bd1fc1e0f473423e8d698d1f001139ea5e',
        alg: 'RS256',
        n:
          'pFUiUVrVz5p_oOX2qyUrM1zOfTYkfJ9hCNDpZJHiHZRi4euVrfYBSVOGRxIS2Mrlrcs1tPMC1roMoB_kOTGx9QIMj70dGv5fdwbzU44diRlaN-tePsx_y5-DCV1bksRpt6qOl9onCBGVZGBJcEefUBCmXXSQYcvVkt5qdAiTKoylgY6m6iSeH8uYJ27N8o3uchGXCk2dTUxEWfHS9eo3B4Sor8jNP2T8l0Adj7iu50gwG6ByliTKE6ZUx5pXZXALvdvFKaRYNfnanC1HgZ5O1Ec7MbwpxF9qgbysJtDxhX-4bfMBGpgnv14vDOjzQNx04r52EcxkbyKZ8jzT6brjlw',
        e: 'AQAB',
      },
      {
        use: 'sig',
        kty: 'RSA',
        kid: '2455da3cb352e4fad6b8ae1a3f6facd5fcef0326',
        alg: 'RS256',
        n:
          'zujKHf6F0IFjYX-XMQfdoJbmTQQ0FNDOsrC5k0M1loKCdOVKlQtaGGIKB8SB83qpWdeUgAw6HuHyv0VR1xSygHz-vBP56YRgQzOjOWC3FLTdrlsJu7flYtxI4MMGLx1TeKhAZk2wpyMmAxEOPZ5xY5T_l8kiqEsZ3kURkUihISdOfnaLQ7-jDNqDNJMyozwNO6lYF7UinXzYmQuTfWkR37-VxJ2g-pcCiHdVbRCnppx5VI2q8-r9vlGPWiKPincOQTIxgcumpWZB_dsePbamRFPQTVOw3O6r8-3axFMWjSsc58D5pgZ66fPFBTS2Ig16cbEN_cU3wy7QcofDsw8nfw',
        e: 'AQAB',
      },
    ],
  };
}
