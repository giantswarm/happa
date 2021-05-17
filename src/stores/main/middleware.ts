import { isJwtExpired } from 'lib/helpers';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { Middleware } from 'redux';
import { getLoggedInUser } from 'stores/main/selectors';

import { LoggedInUserTypes } from './types';

export function mainAuthMiddleware(auth: IOAuth2Provider): Middleware {
  // eslint-disable-next-line consistent-return
  return (store) => (next) => async (action) => {
    if (action.type?.startsWith('LOGOUT_')) {
      return next(action);
    }

    const loggedInUser = getLoggedInUser(store.getState());
    if (!loggedInUser) {
      return next(action);
    }

    if (loggedInUser.type !== LoggedInUserTypes.MAPI) {
      return next(action);
    }

    if (!isJwtExpired(loggedInUser.auth.token)) {
      // User's all good, you can pass.
      return next(action);
    }

    // Let's get the latest user information.
    try {
      const user = await auth.getLoggedInUser();
      if (user && isJwtExpired(user.idToken)) {
        throw new Error('User is expired');
      }

      return next(action);
    } catch (err) {
      await auth.logout();
    }
  };
}
