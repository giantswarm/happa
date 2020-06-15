import { getAuthorityURLFromGSApiURL } from 'lib/CPAuth/util';
import { IOAuth2Config, IOAuth2SigningKey } from 'lib/OAuth2/OAuth2';
import { AppRoutes } from 'shared/constants/routes';

const authority = getAuthorityURLFromGSApiURL(window.config.apiEndpoint);

const signingKeys: IOAuth2SigningKey[] = [
  {
    use: 'sig',
    kty: 'RSA',
    kid: '6ad1b0d8f848706ccba6a64f5123f5e990edda9e',
    alg: 'RS256',
    n:
      'vL98vJchR6JnX67bPhx-FMNKp00u_zmXMX1TPnzgDOu5jQOLrNACKX6CKLeIp4iMO6K-7pPNAb8ih1nmEUuP56ScpmgNBWB5iW8yMa5vjQCujFwge_5yoh5jeUFPjj0fVNseYQCeAk6uvvtsyOzR-tr7YWuN92VK3sCcZOnd09I7Ab_YNG_D3_4v_Hji_9fcXnJdAyT5z6yPQMRODLifmSwE8iEbneKV_h91ILxSte2gXdmwa0Fbeds90sHAS-TUdXDBxi35RDkRJTAWrHzcJLfyC0cE0uTqXrqT7bLfhGSPXkjb7RwW3UaQx-lgQDYN9vZ7TyIB6nVcm_dnizoptQ',
    e: 'AQAB',
  },
  {
    use: 'sig',
    kty: 'RSA',
    kid: '78e01d5cbcd71738feecb9ac50864128c0c78177',
    alg: 'RS256',
    n:
      'ztpSHw_r1hxpzrLncaPXpt-FN_4hScPP6hfAA3yaLBHJ2f2rcEcbQqqb9VlruJIA0-zpYNQtATyRYv5yJMe7Zi2MnYoPZjDvxO0MxaLI8PoKV7UKwme1PbsiJvjl2q6J-GwMF1cHFYj07zKUB9DX05NDOCGSnRHnsMDOeZdRdC9MDO69Pf2zjc1631KomN4MiyKUVs8upqZAuqU04x2xyGLevEd6aJEns4wsPw16kiXyiHiQXfNb41qyy6s5DJ1IkeWVRdQ1dIvzJex0_8eBCu04Qz8XXaLCk3CgoAKbmMvy_YgqOY0Y5lRJZ-2TmgoAl5CvXMl9UsaArOWL9GquRw',
    e: 'AQAB',
  },
  {
    use: 'sig',
    kty: 'RSA',
    kid: 'd75a30cde84050ba7a99ac2c600e4b4cc4216985',
    alg: 'RS256',
    n:
      'x8VGjoFFfz4oBOP3dC1hYRCj2Yfzxv2p5sB2rWs4EraJQjctsbLLQPCTd3aExGX2_ecp7s5r4PCYdrIo_sS0Fkjw7R8CGi8EiBVSC1FMys2aRsca7bkG589XmlRmQ_KQRA5Cg0189zrhbQcHDU2BSXTyeSPCMPctbAaJrc00zjwUPsJiCtmgaKmJXNTloS4TdrNAxyJYIHNqOKfUklCZpxbCcBLafQ5PbZyhJoGyDloo233VQnKbSK9J_s78pWF0yohV0ILbWuis1wgjKT7Aeuo26SxYUwjzw7t2vpeibJBrkvZV0msg4JC183Sx_tsP6nzIA6UyeOPgmy948SDK1w',
    e: 'AQAB',
  },
  {
    use: 'sig',
    kty: 'RSA',
    kid: 'abe4c887927dc0b54e3c0a80d4f6c69164b09c95',
    alg: 'RS256',
    n:
      'qVBKn5BhjwnqelaJe2S2u74QQP5knc0X2mUGaSG-LqKNwbsiYt4EzYn2-ipjEu96aRVvuPqLRGCBfkOAuDJrIpeEe73dLw0VwIZg-KICdgKG3ECD3hgzh0UTSCnmyXJ70ticeuyZr32F1_z-sq8LkbZhrnYlWer0x9xC2m3y8DBJkiUqIhSpvCWDu062MRJQWVtzbPq_SDh4lTc3QVJDKpsKumTxIPB0biuY3rGkQut8_ZCBnFMLPqY7Dhd5mhnCyEwiGLbr3nqkqN-YxGT3KO4q1GS2Ij-PxfqxpOnYjqjqIyt_uUXBpLJP0cFVGsWISc4W59U5Hq6C7kiDeQxSIw',
    e: 'AQAB',
  },
  {
    use: 'sig',
    kty: 'RSA',
    kid: 'efbe6230be40a234793ef5f7f424bd1844e39519',
    alg: 'RS256',
    n:
      'sm0xOVFeJoCv-wzAGX8VNYkeN-OIftHEtCAGxnGLAkrJIDYVmg9BbOJc6yLbgfHLNtGX5rbAId31Y4XJg-zkBYkvJo4IicxHAHl-Q6Mq2-obntDFaYDOW3cuTjfuayOth8QHQYeASdMuT4fnh2tlUUYutLLDapzOYtquGhZ7p_NEmuPLKTvB4mHRQ72PS3POJTcuKT_BR4z2ejxe7QoXO4vP-4OE-46AIS_v9YQ7qa_S0PKZV4yBxbFDPkvSDeVB9JuKNJkj2dkZPKSQRxsYS1Bs2ImPxk_F1jj8Gh3OcmAiplZP-Ss05BsUCA32gDwAf_YIaE_Zdi-vQys6-vJtyw',
    e: 'AQAB',
  },
];

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
  loadUserInfo: true,
  revokeAccessTokenOnLogout: true,
  filterProtocolClaims: true,
  validateSubOnSilentRenew: true,
  persistenceMethod: localStorage,
  signingKeys: signingKeys,
  customMetadata: {
    issuer: authority,
    authorizationEndpoint: `${authority}/auth`,
    tokenEndpoint: `${authority}/token`,
    jwksUri: `${authority}/keys`,
    userInfoEndpoint: `${authority}/userinfo`,
    responseTypesSupported: ['code', 'id_token', 'token'],
    subjectTypesSupported: ['public'],
    idTokenSigningAlgValuesSupported: ['RS256'],
    scopesSupported: ['openid', 'email', 'groups', 'profile', 'offline_access'],
    tokenEndpointAuthMethodsSupported: ['client_secret_basic'],
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
