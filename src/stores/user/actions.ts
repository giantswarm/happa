import GiantSwarm from 'giantswarm';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import Passage, {
  IPassageCreateInvitationResponse,
  IPassageInvitation,
} from 'lib/passageClient';
import { ThunkAction } from 'redux-thunk';
import { getLoggedInUser } from 'stores/main/selectors';
import { IState } from 'stores/state';
import {
  INVITATION_CREATE_ERROR,
  INVITATION_CREATE_REQUEST,
  INVITATION_CREATE_SUCCESS,
  INVITATIONS_LOAD_ERROR,
  INVITATIONS_LOAD_REQUEST,
  INVITATIONS_LOAD_SUCCESS,
  USERS_DELETE_ERROR,
  USERS_DELETE_REQUEST,
  USERS_DELETE_SUCCESS,
  USERS_LOAD_ERROR,
  USERS_LOAD_REQUEST,
  USERS_LOAD_SUCCESS,
  USERS_REMOVE_EXPIRATION_ERROR,
  USERS_REMOVE_EXPIRATION_REQUEST,
  USERS_REMOVE_EXPIRATION_SUCCESS,
} from 'stores/user/constants';
import { UserActions } from 'stores/user/types';

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
    } catch (err) {
      new FlashMessage(
        'Something went wrong while trying to load all users',
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again.'
      );

      dispatch({
        type: USERS_LOAD_ERROR,
      });

      ErrorReporter.getInstance().notify(err as Error);

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
    } catch (err) {
      new FlashMessage(
        'Something went wrong while trying to remove expiration from this user',
        messageType.ERROR,
        messageTTL.MEDIUM
      );

      dispatch({
        type: USERS_REMOVE_EXPIRATION_ERROR,
      });

      ErrorReporter.getInstance().notify(err as Error);
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
    } catch (err) {
      new FlashMessage(
        'Something went wrong while trying to delete this user',
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io'
      );

      dispatch({
        type: USERS_DELETE_ERROR,
      });

      ErrorReporter.getInstance().notify(err as Error);
    }
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
      const token = getLoggedInUser(getState())?.auth.token ?? '';

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

      ErrorReporter.getInstance().notify(err as Error);
    }

    return Promise.resolve();
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
      const token = getLoggedInUser(getState())?.auth.token ?? '';
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
