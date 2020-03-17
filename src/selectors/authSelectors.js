import * as userActions from 'actions/userActions';
import Auth from 'lib/auth0';
import { isJwtExpired } from 'lib/helpers';
import { AuthorizationTypes, StatusCodes } from 'shared';

/**
 * @typedef {Object} SSOError
 * @property {number} status - Status code
 */

/**
 * Select the currently stored authentication token, or a renewed one,
 * if the current one is expired
 * @param {import("redux").Dispatch} dispatch - An event dispatcher
 * @param {Record<string, any>} state - The current state in the store
 * @return {Promise<[string, string]>} [<Authentication Token>, <Authentication Scheme>]
 * @throws {SSOError} Authentication token renewal failed
 */
export async function selectAuthToken(dispatch, state) {
  const { auth } = state.main.loggedInUser;
  const scheme = auth.scheme;
  let currentToken = auth.token;

  try {
    /**
     * Renew the token if the user is logged in via SSO,
     * and the current token is expired
     * */
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
