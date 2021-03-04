import { User } from 'oidc-client';
import { AuthorizationTypes } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

export interface IOAuth2User {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  authorizationType: PropertiesOf<typeof AuthorizationTypes>;

  groups: string[];
  email: string;
  emailVerified: boolean;
}

export function isUserExpired(user: IOAuth2User): boolean {
  const sInMs = 1000;
  const now = Math.trunc(Date.now() / sInMs); // In seconds.
  const expiresIn = user.expiresAt - now;

  return expiresIn <= 0;
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
