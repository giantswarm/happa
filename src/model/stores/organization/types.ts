import {
  ORGANIZATION_ADD_MEMBER_CONFIRMED,
  ORGANIZATION_ADD_MEMBER_ERROR,
  ORGANIZATION_ADD_MEMBER_REQUEST,
  ORGANIZATION_CREATE_CONFIRMED,
  ORGANIZATION_CREATE_ERROR,
  ORGANIZATION_CREATE_REQUEST,
  ORGANIZATION_CREATE_SUCCESS,
  ORGANIZATION_CREDENTIALS_LOAD_ERROR,
  ORGANIZATION_CREDENTIALS_LOAD_REQUEST,
  ORGANIZATION_CREDENTIALS_LOAD_SUCCESS,
  ORGANIZATION_CREDENTIALS_SET,
  ORGANIZATION_CREDENTIALS_SET_CONFIRMED_REQUEST,
  ORGANIZATION_CREDENTIALS_SET_DISCARD,
  ORGANIZATION_CREDENTIALS_SET_ERROR,
  ORGANIZATION_CREDENTIALS_SET_SUCCESS,
  ORGANIZATION_DELETE_CONFIRMED,
  ORGANIZATION_DELETE_ERROR,
  ORGANIZATION_DELETE_REQUEST,
  ORGANIZATION_DELETE_SUCCESS,
  ORGANIZATION_LOAD_ERROR,
  ORGANIZATION_LOAD_MAPI_REQUEST,
  ORGANIZATION_LOAD_REQUEST,
  ORGANIZATION_LOAD_SUCCESS,
  ORGANIZATION_REMOVE_MEMBER,
  ORGANIZATION_REMOVE_MEMBER_CONFIRMED_REQUEST,
  ORGANIZATION_REMOVE_MEMBER_ERROR,
  ORGANIZATION_SELECT,
} from 'model/stores/organization/constants';

export interface IOrganizationState {
  lastUpdated: number;
  isFetching: boolean;
  items: Record<string, IOrganization>;
  credentials: {
    lastUpdated: number;
    isFetching: boolean;
    items: ICredential[];
    showForm: boolean;
  };
}

export interface IOrganizationSelectAction {
  type: typeof ORGANIZATION_SELECT;
  orgId: string;
}

export interface IOrganizationLoadRequestAction {
  type: typeof ORGANIZATION_LOAD_REQUEST;
}

export interface IOrganizationLoadMAPIRequestAction {
  type: typeof ORGANIZATION_LOAD_MAPI_REQUEST;
}

export interface IOrganizationLoadSuccessAction {
  type: typeof ORGANIZATION_LOAD_SUCCESS;
  organizations: Record<string, IOrganization>;
  selectedOrganization: string | null;
}

export interface IOrganizationLoadErrorAction {
  type: typeof ORGANIZATION_LOAD_ERROR;
}

export interface IOrganizationCreateRequestAction {
  type: typeof ORGANIZATION_CREATE_REQUEST;
}

export interface IOrganizationCreateConfirmedAction {
  type: typeof ORGANIZATION_CREATE_CONFIRMED;
}

export interface IOrganizationCreateSuccessAction {
  type: typeof ORGANIZATION_CREATE_SUCCESS;
}

export interface IOrganizationCreateErrorAction {
  type: typeof ORGANIZATION_CREATE_ERROR;
}

export interface IOrganizationDeleteRequestAction {
  type: typeof ORGANIZATION_DELETE_REQUEST;
  orgId: string;
}

export interface IOrganizationDeleteSuccessAction {
  type: typeof ORGANIZATION_DELETE_SUCCESS;
  orgId: string;
}

export interface IOrganizationDeleteConfirmedAction {
  type: typeof ORGANIZATION_DELETE_CONFIRMED;
  orgId: string;
}

export interface IOrganizationDeleteErrorAction {
  type: typeof ORGANIZATION_DELETE_ERROR;
}

export interface IOrganizationCredentialsLoadRequestAction {
  type: typeof ORGANIZATION_CREDENTIALS_LOAD_REQUEST;
}

export interface IOrganizationCredentialsLoadSuccessAction {
  type: typeof ORGANIZATION_CREDENTIALS_LOAD_SUCCESS;
  credentials: ICredential[];
}

export interface IOrganizationCredentialsLoadErrorAction {
  type: typeof ORGANIZATION_CREDENTIALS_LOAD_ERROR;
}

export interface IOrganizationCredentialsSetAction {
  type: typeof ORGANIZATION_CREDENTIALS_SET;
}

export interface IOrganizationCredentialsSetAction {
  type: typeof ORGANIZATION_CREDENTIALS_SET;
}

export interface IOrganizationCredentialsSetErrorAction {
  type: typeof ORGANIZATION_CREDENTIALS_SET_ERROR;
}

export interface IOrganizationCredentialsSetDiscardAction {
  type: typeof ORGANIZATION_CREDENTIALS_SET_DISCARD;
}

export interface IOrganizationCredentialsSetSuccessAction {
  type: typeof ORGANIZATION_CREDENTIALS_SET_SUCCESS;
}

export interface IOrganizationCredentialsSetConfirmedRequestAction {
  type: typeof ORGANIZATION_CREDENTIALS_SET_CONFIRMED_REQUEST;
}

export interface IOrganizationAddMemberRequestAction {
  type: typeof ORGANIZATION_ADD_MEMBER_REQUEST;
  orgId: string;
}

export interface IOrganizationAddMemberConfirmedAction {
  type: typeof ORGANIZATION_ADD_MEMBER_CONFIRMED;
  orgId: string;
  email: string;
}

export interface IOrganizationAddMemberErrorAction {
  type: typeof ORGANIZATION_ADD_MEMBER_ERROR;
  orgId: string;
  errorMessage: string;
}

export interface IOrganizationRemoveMemberAction {
  type: typeof ORGANIZATION_REMOVE_MEMBER;
  orgId: string;
  email: string;
}

export interface IOrganizationRemoveMemberConfirmedRequestAction {
  type: typeof ORGANIZATION_REMOVE_MEMBER_CONFIRMED_REQUEST;
  orgId: string;
  email: string;
}

export interface IOrganizationRemoveMemberErrorAction {
  type: typeof ORGANIZATION_REMOVE_MEMBER_ERROR;
}

export type OrganizationActions =
  | IOrganizationSelectAction
  | IOrganizationLoadSuccessAction
  | IOrganizationLoadErrorAction
  | IOrganizationLoadMAPIRequestAction
  | IOrganizationLoadRequestAction
  | IOrganizationCreateRequestAction
  | IOrganizationCreateConfirmedAction
  | IOrganizationCreateSuccessAction
  | IOrganizationCreateErrorAction
  | IOrganizationDeleteRequestAction
  | IOrganizationDeleteSuccessAction
  | IOrganizationDeleteConfirmedAction
  | IOrganizationDeleteErrorAction
  | IOrganizationCredentialsSetAction
  | IOrganizationCredentialsSetErrorAction
  | IOrganizationCredentialsSetConfirmedRequestAction
  | IOrganizationCredentialsSetDiscardAction
  | IOrganizationCredentialsSetSuccessAction
  | IOrganizationCredentialsLoadRequestAction
  | IOrganizationCredentialsLoadSuccessAction
  | IOrganizationCredentialsLoadErrorAction
  | IOrganizationAddMemberRequestAction
  | IOrganizationAddMemberConfirmedAction
  | IOrganizationAddMemberErrorAction
  | IOrganizationRemoveMemberAction
  | IOrganizationRemoveMemberConfirmedRequestAction
  | IOrganizationRemoveMemberErrorAction;
