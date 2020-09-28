import { CallHistoryMethodAction, push } from 'connected-react-router';
import GiantSwarm from 'giantswarm';
import { Base64 } from 'js-base64';
import { IAuthResult } from 'lib/auth0';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import Passage, {
  IPassageCreateInvitationResponse,
  IPassageInvitation,
  IRequestPasswordRecoveryTokenResponse,
  ISetNewPasswordResponse,
  IVerifyPasswordRecoveryTokenResponse,
} from 'lib/passageClient';
import { GenericResponse } from 'model/clients/GenericResponse';
import { GiantSwarmClient } from 'model/clients/GiantSwarmClient';
import { getInstallationInfo } from 'model/services/giantSwarm/info';
import { IState } from 'reducers/types';
import { ThunkAction } from 'redux-thunk';
import { AuthorizationTypes, StatusCodes } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';
import {
  INFO_LOAD_ERROR,
  INFO_LOAD_REQUEST,
  INFO_LOAD_SUCCESS,
  INVITATION_CREATE_ERROR,
  INVITATION_CREATE_REQUEST,
  INVITATION_CREATE_SUCCESS,
  INVITATIONS_LOAD_ERROR,
  INVITATIONS_LOAD_REQUEST,
  INVITATIONS_LOAD_SUCCESS,
  LOGIN_ERROR,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_ERROR,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  REFRESH_USER_INFO_ERROR,
  REFRESH_USER_INFO_REQUEST,
  REFRESH_USER_INFO_SUCCESS,
  REQUEST_PASSWORD_RECOVERY_TOKEN_REQUEST,
  SET_NEW_PASSWORD,
  USERS_DELETE_ERROR,
  USERS_DELETE_REQUEST,
  USERS_DELETE_SUCCESS,
  USERS_LOAD_ERROR,
  USERS_LOAD_REQUEST,
  USERS_LOAD_SUCCESS,
  USERS_REMOVE_EXPIRATION_ERROR,
  USERS_REMOVE_EXPIRATION_REQUEST,
  USERS_REMOVE_EXPIRATION_SUCCESS,
  VERIFY_PASSWORD_RECOVERY_TOKEN,
} from 'stores/user/constants';
import { selectAuthToken } from 'stores/user/selectors';
import { UserActions } from 'stores/user/types';

export function loginSuccess(userData: ILoggedInUser): UserActions {
  return {
    type: LOGIN_SUCCESS,
    userData,
  };
}

export function loginError(errorMessage: string): UserActions {
  return {
    type: LOGIN_ERROR,
    errorMessage,
  };
}

export function logoutSuccess(): UserActions {
  return { type: LOGOUT_SUCCESS };
}

export function logoutError(errorMessage: string): UserActions {
  return {
    type: LOGOUT_ERROR,
    errorMessage,
  };
}

export function refreshUserInfo(): ThunkAction<
  Promise<void>,
  IState,
  void,
  UserActions | CallHistoryMethodAction
> {
  return async (dispatch, getState) => {
    const loggedInUser = getState().main.loggedInUser;
    if (!loggedInUser) {
      dispatch({
        type: REFRESH_USER_INFO_ERROR,
        error: 'No logged in user to refresh.',
      });

      return Promise.reject(new Error('No logged in user to refresh.'));
    }

    try {
      dispatch({ type: REFRESH_USER_INFO_REQUEST });
      const usersApi = new GiantSwarm.UsersApi();
      const response = await usersApi.getCurrentUser();

      dispatch({
        type: REFRESH_USER_INFO_SUCCESS,
        email: response.email,
      });

      return Promise.resolve();
    } catch (err) {
      if (err.status === StatusCodes.Unauthorized) {
        new FlashMessage(
          'Please log in again, as your previously saved credentials appear to be invalid.',
          messageType.WARNING,
          messageTTL.MEDIUM
        );
        const redirectPath = loggedInUser.isAdmin
          ? AppRoutes.AdminLogin
          : AppRoutes.Login;

        dispatch(push(redirectPath));
      } else {
        new FlashMessage(
          'Something went wrong while trying to load user and organization information.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again in a moment or contact support: support@giantswarm.io'
        );
      }

      dispatch({
        type: REFRESH_USER_INFO_ERROR,
        error: err,
      });

      return Promise.resolve();
    }
  };
}

export function auth0Login(
  authResult: IAuthResult
): ThunkAction<Promise<void>, IState, void, UserActions> {
  return async (dispatch) => {
    return new Promise((resolve) => {
      let isAdmin = false;
      if (
        authResult.idTokenPayload['https://giantswarm.io/groups'] ===
        'api-admin'
      ) {
        isAdmin = true;
      }

      const userData: ILoggedInUser = {
        email: authResult.idTokenPayload.email,
        auth: {
          scheme: AuthorizationTypes.BEARER,
          token: authResult.accessToken,
        },
        isAdmin,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      dispatch(loginSuccess(userData));

      resolve();
    });
  };
}

export function giantswarmLogin(
  email: string,
  password: string
): ThunkAction<
  Promise<void>,
  IState,
  void,
  UserActions | CallHistoryMethodAction
> {
  return async (dispatch) => {
    try {
      dispatch({
        type: LOGIN_REQUEST,
        email: email,
      });

      const authTokensApi = new GiantSwarm.AuthTokensApi();
      const response = await authTokensApi.createAuthToken({
        email,
        password_base64: Base64.encode(password),
      });
      const userData: ILoggedInUser = {
        email,
        auth: {
          scheme: AuthorizationTypes.GS,
          token: response.auth_token,
        },
        isAdmin: false,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      dispatch(loginSuccess(userData));

      return Promise.resolve();
    } catch (err) {
      const message = (err as Error).message ?? (err as string);
      dispatch(loginError(message));
      dispatch(push(AppRoutes.Login));

      return Promise.reject(err);
    }
  };
}

export function giantswarmLogout(): ThunkAction<
  Promise<void>,
  IState,
  void,
  UserActions | CallHistoryMethodAction
> {
  return async (dispatch) => {
    try {
      dispatch({ type: LOGOUT_REQUEST });

      const authTokensApi = new GiantSwarm.AuthTokensApi();
      await authTokensApi.deleteAuthToken();

      dispatch(push(AppRoutes.Login));
      dispatch(logoutSuccess());

      return Promise.resolve();
    } catch (err) {
      dispatch(push(AppRoutes.Login));
      dispatch(logoutError(err));

      return Promise.reject(err);
    }
  };
}

export function getInfo(): ThunkAction<
  Promise<void>,
  IState,
  void,
  UserActions
> {
  return async (dispatch, getState) => {
    dispatch({ type: INFO_LOAD_REQUEST });

    try {
      const [authToken, authScheme] = await selectAuthToken(dispatch)(
        getState()
      );
      const httpClient = new GiantSwarmClient(authToken, authScheme);
      const infoRes = await getInstallationInfo(httpClient);

      dispatch({
        type: INFO_LOAD_SUCCESS,
        info: infoRes.data,
      });

      return Promise.resolve();
    } catch (err) {
      dispatch({
        type: INFO_LOAD_ERROR,
        error: (err as GenericResponse<string>).data,
      });

      return Promise.reject(err);
    }
  };
}

export function usersLoad(): ThunkAction<
  Promise<void>,
  IState,
  void,
  UserActions
> {
  return async (dispatch, getState) => {
    const alreadyFetching = getState().entities.users.isFetching;
    if (alreadyFetching) {
      return Promise.resolve();
    }

    try {
      dispatch({ type: USERS_LOAD_REQUEST });

      const usersApi = new GiantSwarm.UsersApi();
      const response = await usersApi.getUsers();

      const users = Array.from(response).reduce(
        (agg: Record<string, IUser>, curr: GiantSwarm.V4UserListItem) => {
          agg[curr.email] = {
            ...curr,
            emaildomain: curr.email.split('@')[1],
          };

          return agg;
        },
        {}
      );

      dispatch({
        type: USERS_LOAD_SUCCESS,
        users,
      });

      return Promise.resolve();
    } catch {
      new FlashMessage(
        'Something went wrong while trying to load all users',
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again.'
      );

      dispatch({
        type: USERS_LOAD_ERROR,
      });

      return Promise.resolve();
    }
  };
}

export function userRemoveExpiration(
  email: string
): ThunkAction<Promise<void>, IState, void, UserActions> {
  return async (dispatch) => {
    try {
      const NEVER_EXPIRES = '0001-01-01T00:00:00Z';

      dispatch({ type: USERS_REMOVE_EXPIRATION_REQUEST });
      const usersApi = new GiantSwarm.UsersApi();
      const response = await usersApi.modifyUser(email, {
        expiry: NEVER_EXPIRES,
      } as GiantSwarm.V4ModifyUserRequest);

      const user: IUser = {
        ...response,
        emaildomain: response.email.split('@')[1],
      };

      dispatch({
        type: USERS_REMOVE_EXPIRATION_SUCCESS,
        user,
      });
    } catch {
      new FlashMessage(
        'Something went wrong while trying to remove expiration from this user',
        messageType.ERROR,
        messageTTL.MEDIUM
      );

      dispatch({
        type: USERS_REMOVE_EXPIRATION_ERROR,
      });
    }
  };
}

export function userDelete(
  email: string
): ThunkAction<Promise<void>, IState, void, UserActions> {
  return async (dispatch) => {
    try {
      dispatch({ type: USERS_DELETE_REQUEST });

      const usersApi = new GiantSwarm.UsersApi();
      await usersApi.deleteUser(email);

      dispatch({
        type: USERS_DELETE_SUCCESS,
        email,
      });
    } catch {
      new FlashMessage(
        'Something went wrong while trying to delete this user',
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io'
      );

      dispatch({
        type: USERS_DELETE_ERROR,
      });
    }
  };
}

export function requestPasswordRecoveryToken(
  email: string
): ThunkAction<
  Promise<IRequestPasswordRecoveryTokenResponse>,
  IState,
  void,
  UserActions
> {
  return (dispatch) => {
    dispatch({
      type: REQUEST_PASSWORD_RECOVERY_TOKEN_REQUEST,
    });

    const passage = new Passage({ endpoint: window.config.passageEndpoint });

    return passage.requestPasswordRecoveryToken({ email });
  };
}

export function verifyPasswordRecoveryToken(
  email: string,
  token: string
): ThunkAction<
  Promise<IVerifyPasswordRecoveryTokenResponse>,
  IState,
  void,
  UserActions
> {
  return (dispatch) => {
    dispatch({
      type: VERIFY_PASSWORD_RECOVERY_TOKEN,
    });

    const passage = new Passage({ endpoint: window.config.passageEndpoint });

    return passage.verifyPasswordRecoveryToken({ email, token });
  };
}

export function setNewPassword(
  email: string,
  token: string,
  password: string
): ThunkAction<Promise<ISetNewPasswordResponse>, IState, void, UserActions> {
  return (dispatch) => {
    dispatch({
      type: SET_NEW_PASSWORD,
    });

    const passage = new Passage({ endpoint: window.config.passageEndpoint });

    return passage.setNewPassword({ email, token, password });
  };
}

export function invitationsLoad(): ThunkAction<
  Promise<void>,
  IState,
  void,
  UserActions
> {
  return async (dispatch, getState) => {
    try {
      const alreadyFetching = getState().entities.users.invitations.isFetching;
      if (alreadyFetching) {
        return Promise.resolve();
      }

      dispatch({ type: INVITATIONS_LOAD_REQUEST });

      const passage = new Passage({ endpoint: window.config.passageEndpoint });
      const token = getState().main.loggedInUser.auth.token;

      const response = await passage.getInvitations(token);
      const invites = response.reduce(
        (agg: Record<string, IInvitation>, curr: IPassageInvitation) => {
          agg[curr.email] = {
            ...curr,
            emaildomain: curr.email.split('@')[1],
          };

          return agg;
        },
        {}
      );

      dispatch({
        type: INVITATIONS_LOAD_SUCCESS,
        invites,
      });

      return Promise.resolve();
    } catch (err) {
      new FlashMessage(
        'Something went wrong while trying to load invitations',
        messageType.ERROR,
        messageTTL.MEDIUM,
        'Please try again later or contact support: support@giantswarm.io'
      );

      dispatch({
        type: INVITATIONS_LOAD_ERROR,
      });

      return Promise.reject(err);
    }
  };
}

export function invitationCreate(invitation: {
  email: string;
  organizations: string;
  sendEmail: boolean;
}): ThunkAction<
  Promise<IPassageCreateInvitationResponse>,
  IState,
  void,
  UserActions
> {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: INVITATION_CREATE_REQUEST });

      const passage = new Passage({ endpoint: window.config.passageEndpoint });
      const token = getState().main.loggedInUser.auth.token;
      const response = await passage.createInvitation(token, invitation);

      dispatch({
        type: INVITATION_CREATE_SUCCESS,
      });

      await dispatch(invitationsLoad());

      return response;
    } catch (err) {
      new FlashMessage(
        'Something went wrong while trying to create your invitation.',
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io'
      );

      dispatch({
        type: INVITATION_CREATE_ERROR,
      });

      return Promise.reject(err);
    }
  };
}
