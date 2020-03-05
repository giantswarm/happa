import * as userActions from 'actions/userActions';
import Auth from 'lib/auth0';
import { isJwtExpired } from 'lib/helpers';
import { AuthorizationTypes, StatusCodes } from 'shared';

export async function selectAuthToken(dispatch, state) {
  const { auth } = state.app.loggedInUser;
  const scheme = auth.scheme;
  let currentToken = auth.token;

  try {
    if (scheme === AuthorizationTypes.BEARER && isJwtExpired(currentToken)) {
      const newAuthData = await Auth.getInstance().renewToken();
      currentToken = newAuthData.accessToken;

      await dispatch(userActions.auth0Login(newAuthData));
    }

    return [currentToken, scheme];
  } catch (err) {
    const newErr = Object.assign({}, err, {
      status: StatusCodes.Unauthorized,
    });

    return Promise.reject(newErr);
  }
}
