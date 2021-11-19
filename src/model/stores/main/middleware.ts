import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { isJwtExpired } from 'lib/helpers';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { getLoggedInUser } from 'model/stores/main/selectors';
import { Middleware } from 'redux';

import { LoggedInUserTypes } from './types';

export function mainAuthMiddleware(auth: IOAuth2Provider): Middleware {
  return (store) => (next) => async (action) => {
    const loggedInUser = getLoggedInUser(store.getState());
    switch (true) {
      case loggedInUser === null:
      case loggedInUser?.type !== LoggedInUserTypes.MAPI:
      case action.type?.startsWith('LOGOUT_'):
      case loggedInUser && !isJwtExpired(loggedInUser.auth.token):
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
      try {
        await auth.logout();
      } catch (logoutError) {
        ErrorReporter.getInstance().notify(logoutError as Error);
      }

      new FlashMessage(
        'Your authentication token could not be renewed',
        messageType.ERROR,
        messageTTL.LONG,
        'Please log in again. If the problem persists, contact support: support@giantswarm.io'
      );

      ErrorReporter.getInstance().notify(err as Error);
    }

    return Promise.resolve();
  };
}
