import { IOAuth2User } from 'lib/OAuth2/OAuth2User';

import { LoggedInUserTypes } from './types';

export function mapOAuth2UserToUser(user: IOAuth2User): ILoggedInUser {
  // TODO(axbarsan): Determine if the user is admin or not.
  const isAdmin = false;

  return {
    email: user.email,
    auth: {
      scheme: user.authorizationType,
      token: user.idToken,
      expiresAt: user.expiresAt,
      refreshToken: user.refreshToken,
    },
    emailVerified: user.emailVerified,
    groups: user.groups,
    type: LoggedInUserTypes.MAPI,
    isAdmin,
  };
}
