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
} from 'model/stores/user/constants';

export interface IUserState {
  lastUpdated: number;
  isFetching: boolean;
  items: Record<string, IUser>;
  invitations: {
    lastUpdated: number;
    isFetching: boolean;
    items: Record<string, IInvitation>;
  };
}

export interface IUserLoadRequestAction {
  type: typeof USERS_LOAD_REQUEST;
}

export interface IUserLoadSuccessAction {
  type: typeof USERS_LOAD_SUCCESS;
  users: Record<string, IUser>;
}

export interface IUserLoadErrorAction {
  type: typeof USERS_LOAD_ERROR;
}

export interface IUserRemoveExpirationRequestAction {
  type: typeof USERS_REMOVE_EXPIRATION_REQUEST;
}

export interface IUserRemoveExpirationSuccessAction {
  type: typeof USERS_REMOVE_EXPIRATION_SUCCESS;
  user: IUser;
}

export interface IUserDeleteRequestAction {
  type: typeof USERS_DELETE_REQUEST;
}

export interface IUserDeleteSuccessAction {
  type: typeof USERS_DELETE_SUCCESS;
  email: string;
}

export interface IUserDeleteErrorAction {
  type: typeof USERS_DELETE_ERROR;
}

export interface IUserRemoveExpirationErrorAction {
  type: typeof USERS_REMOVE_EXPIRATION_ERROR;
}

export interface IUserLoadInvitationsRequestAction {
  type: typeof INVITATIONS_LOAD_REQUEST;
}

export interface IUserLoadInvitationsSuccessAction {
  type: typeof INVITATIONS_LOAD_SUCCESS;
  invites: Record<string, IInvitation>;
}

export interface IUserLoadInvitationsErrorAction {
  type: typeof INVITATIONS_LOAD_ERROR;
}

export interface IUserCreateInvitationRequestAction {
  type: typeof INVITATION_CREATE_REQUEST;
}

export interface IUserCreateInvitationSuccessAction {
  type: typeof INVITATION_CREATE_SUCCESS;
}

export interface IUserCreateInvitatioErrorAction {
  type: typeof INVITATION_CREATE_ERROR;
}

export type UserActions =
  | IUserLoadRequestAction
  | IUserLoadSuccessAction
  | IUserLoadErrorAction
  | IUserRemoveExpirationRequestAction
  | IUserRemoveExpirationSuccessAction
  | IUserRemoveExpirationErrorAction
  | IUserDeleteRequestAction
  | IUserDeleteSuccessAction
  | IUserDeleteErrorAction
  | IUserLoadInvitationsRequestAction
  | IUserLoadInvitationsSuccessAction
  | IUserLoadInvitationsErrorAction
  | IUserCreateInvitationRequestAction
  | IUserCreateInvitationSuccessAction
  | IUserCreateInvitatioErrorAction;
