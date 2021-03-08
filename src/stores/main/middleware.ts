import { isJwtExpired } from 'lib/helpers';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { AnyAction, Middleware } from 'redux';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import { logout } from 'stores/main/actions';
import { getLoggedInUser } from 'stores/main/selectors';
import { IState } from 'stores/state';

import { LoggedInUserTypes } from './types';

export function mainAuthMiddleware(auth: IOAuth2Provider): Middleware {
  return (store) => (next: IAsynchronousDispatch<IState>) => async (
    action: AnyAction
  ) => {
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
        /**
         * If we're getting here, it means that the renewal failed,
         * so we need to clear the user data to prevent infinite loops.
         */

        return next(logout(auth));
      }

      return next(action);
    } catch (err) {
      return next(logout(auth));
    }
  };
}
