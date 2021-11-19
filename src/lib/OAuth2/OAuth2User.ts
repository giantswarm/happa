/* istanbul ignore file */

import { User } from 'oidc-client';
import { AuthorizationTypes } from 'shared/constants';

export interface IOAuth2User {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  authorizationType: PropertiesOf<typeof AuthorizationTypes>;

  groups: string[];
  email: string;
  emailVerified: boolean;
}

export function getUserFromOIDCUser(user: User): IOAuth2User {
  return {
    authorizationType: AuthorizationTypes.BEARER,
    idToken: user.id_token,
    refreshToken: user.refresh_token ?? '',
    expiresAt: user.expires_at,
    groups: user.profile.groups ?? [],
    email: user.profile.email ?? '',
    emailVerified: user.profile.email_verified ?? false,
  };
}
