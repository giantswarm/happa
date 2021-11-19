import { IOAuth2User } from 'utils/OAuth2/OAuth2User';

import { LoggedInUserTypes } from './types';

const MAPI_ADMIN_GROUP = window.config.mapiAuthAdminGroup;

export function mapOAuth2UserToUser(user: IOAuth2User): ILoggedInUser {
  const isAdmin = user.groups.includes(MAPI_ADMIN_GROUP);

  return {
    email: user.email,
    auth: {
      scheme: user.authorizationType,
      token: user.idToken,
    },
    groups: user.groups,
    type: LoggedInUserTypes.MAPI,
    isAdmin,
  };
}
