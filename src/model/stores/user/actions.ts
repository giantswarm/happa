import GiantSwarm from 'giantswarm';
import { IState } from 'model/stores/state';
import {
  USERS_DELETE_ERROR,
  USERS_DELETE_REQUEST,
  USERS_DELETE_SUCCESS,
  USERS_LOAD_ERROR,
  USERS_LOAD_REQUEST,
  USERS_LOAD_SUCCESS,
  USERS_REMOVE_EXPIRATION_ERROR,
  USERS_REMOVE_EXPIRATION_REQUEST,
  USERS_REMOVE_EXPIRATION_SUCCESS,
} from 'model/stores/user/constants';
import { IUser, UserActions } from 'model/stores/user/types';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';

export function usersLoad(): ThunkAction<
  Promise<void>,
  IState,
  void,
  UserActions
> {
  return async (dispatch: ThunkDispatch<IState, void, UserActions>, getState: () => IState) => {
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
  return async (dispatch: ThunkDispatch<IState, void, UserActions>) => {
    try {
      const NEVER_EXPIRES = '0001-01-01T00:00:00Z';

      dispatch({ type: USERS_REMOVE_EXPIRATION_REQUEST } as const);
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
      } as const);
    } catch (err) {
      new FlashMessage(
        'Something went wrong while trying to remove expiration from this user',
        messageType.ERROR,
        messageTTL.MEDIUM
      );

      dispatch({
        type: USERS_REMOVE_EXPIRATION_ERROR,
      } as const);

      ErrorReporter.getInstance().notify(err as Error);
    }
  };
}

export function userDelete(
  email: string
): ThunkAction<Promise<void>, IState, void, UserActions> {
  return async (dispatch: ThunkDispatch<IState, void, UserActions>) => {
    try {
      dispatch({ type: USERS_DELETE_REQUEST } as const);

      const usersApi = new GiantSwarm.UsersApi();
      await usersApi.deleteUser(email);

      dispatch({
        type: USERS_DELETE_SUCCESS,
        email,
      } as const);
    } catch (err) {
      new FlashMessage(
        'Something went wrong while trying to delete this user',
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io'
      );

      dispatch({
        type: USERS_DELETE_ERROR,
      } as const);

      ErrorReporter.getInstance().notify(err as Error);
    }
  };
}
