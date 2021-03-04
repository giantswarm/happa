import MapiAuth from 'lib/MapiAuth/MapiAuth';
import { isUserExpired } from 'lib/OAuth2/OAuth2User';
import { AnyAction, Middleware } from 'redux';
import { loadMapiUserError, mapiUserExpired } from 'stores/main/actions';
import {
  MAPI_AUTH_USER_EXPIRED,
  MAPI_AUTH_USER_LOAD,
} from 'stores/main/constants';
import { getMapiAuthUser } from 'stores/main/selectors';

export function mapiAuthMiddleware(mapiAuth: MapiAuth): Middleware {
  return (store) => (next) => async (action: AnyAction) => {
    if (
      action.type === MAPI_AUTH_USER_EXPIRED ||
      action.type?.startsWith(MAPI_AUTH_USER_LOAD)
    ) {
      // Let's not create any infinite loops.
      return next(action);
    }

    const loggedInUser = getMapiAuthUser(store.getState());
    if (loggedInUser) {
      if (!isUserExpired(loggedInUser)) {
        // User's all good, you can pass.
        return next(action);
      }
    }

    // Let's get the latest user information.
    try {
      const user = await mapiAuth.getLoggedInUser();
      if (user && isUserExpired(user)) {
        /**
         * If we're getting here, it means that the renewal failed,
         * so we need to clear the user data to prevent infinite loops.
         */
        await mapiAuth.logout();

        return next(mapiUserExpired());
      }

      return next(action);
    } catch (err) {
      // Delete all stale storage.
      await mapiAuth.logout();

      return next(loadMapiUserError(err.toString()));
    }
  };
}
