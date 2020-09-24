import Auth from 'lib/auth0';
import { isJwtExpired } from 'lib/helpers';
import { IState } from 'reducers/types';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { AuthorizationTypes, StatusCodes } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { auth0Login } from 'stores/user/actions';

export interface ISSOError {
  status: number;
}

export function getUserIsAdmin(state: IState) {
  return state.main.loggedInUser.isAdmin;
}

/**
 * Select the currently stored authentication token, or a renewed one,
 * if the current one is expired.
 * @param dispatch
 */
export const selectAuthToken = (
  dispatch: ThunkDispatch<IState, void, AnyAction>
) => {
  return async (
    state: IState
  ): Promise<
    [token: string, scheme: PropertiesOf<typeof AuthorizationTypes>]
  > => {
    const { auth } = state.main.loggedInUser;
    const scheme = auth.scheme;
    let currentToken = auth.token;

    try {
      /**
       * Renew the token if the user is logged in via SSO,
       * and the current token is expired.
       * */
      if (scheme === AuthorizationTypes.BEARER && isJwtExpired(currentToken)) {
        const newAuthData = await Auth.getInstance().renewToken();
        currentToken = newAuthData.accessToken;

        await dispatch(auth0Login(newAuthData));
      }

      return [currentToken, scheme];
    } catch (err: unknown) {
      const newErr: ISSOError = Object.assign({}, err, {
        status: StatusCodes.Unauthorized,
      });

      return Promise.reject(newErr);
    }
  };
};
