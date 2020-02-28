import * as userActions from 'actions/userActions';
import Auth from 'lib/auth0';
import { isJwtExpired } from 'lib/helpers';
import { StatusCodes } from 'shared';

export async function selectAuthToken(dispatch, state) {
  let currentToken = state.app.loggedInUser.auth.token;

  try {
    if (isJwtExpired(currentToken)) {
      const newAuthData = await Auth.getInstance().renewToken();
      currentToken = newAuthData.accessToken;

      await dispatch(userActions.auth0Login(newAuthData));
    }

    return currentToken;
  } catch (err) {
    const newErr = Object.assign({}, err, { status: StatusCodes.Unauthorized });

    throw newErr;
  }
}
