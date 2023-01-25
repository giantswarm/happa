import { IOAuth2User } from 'utils/OAuth2/OAuth2User';

import { LoggedInUserTypes } from './types';

const MAPI_ADMIN_GROUPS = window.config.mapiAuthAdminGroups;

export function mapOAuth2UserToUser(user: IOAuth2User): ILoggedInUser {
  const isAdmin = user.groups.some((group) =>
    MAPI_ADMIN_GROUPS.includes(group)
  );

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
