/* istanbul ignore file */

import { AuthorizationTypes } from 'model/constants';
import { User } from 'oidc-client-ts';

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
    idToken: user.id_token ?? '',
    refreshToken: user.refresh_token ?? '',
    expiresAt: user.expires_at ?? 0,
    groups: (user.profile.groups as string[]) ?? [],
    email: user.profile.email ?? '',
    emailVerified: user.profile.email_verified ?? false,
  };
}
