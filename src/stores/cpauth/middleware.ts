import CPAuth from 'lib/CPAuth/CPAuth';
import OAuth2UserImpl from 'lib/OAuth2/OAuth2User';
import { AnyAction, Middleware } from 'redux';
import { loadUserError, userExpired } from 'stores/cpauth/actions';
import { CPAUTH_USER_EXPIRED, CPAUTH_USER_LOAD } from 'stores/cpauth/constants';
import { getCPAuthUser } from 'stores/cpauth/selectors';

export function cpAuthMiddleware(cpAuth: CPAuth): Middleware {
  return (store) => (next) => async (action: AnyAction) => {
    if (
      action.type === CPAUTH_USER_EXPIRED ||
      action.type?.startsWith(CPAUTH_USER_LOAD)
    ) {
      // Let's not create any infinite loops.
      return next(action);
    }

    const loggedInUser = getCPAuthUser(store.getState());
    if (loggedInUser) {
      const user = new OAuth2UserImpl(loggedInUser);
      if (!user.isExpired()) {
        // User's all good, you can pass.
        return next(action);
      }
    }

    // Let's get the latest user information.
    try {
      const user = await cpAuth.getLoggedInUser();
      if (user?.isExpired()) {
        return next(userExpired());
      }

      return next(action);
    } catch (err) {
      // Delete all stale storage.
      await cpAuth.logout();

      return next(loadUserError(err.toString()));
    }
  };
}
