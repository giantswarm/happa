/**
 * All our redux action types are defined here.
 *
 * Action type names usually follow some conventions.
 *
 * User transactions like deleting a cluster usually involve several action types
 * named using a common prefix. Example:
 *
 *   'CLUSTER_DELETE'
 *      Invoked when the user expressed the intend to delete a cluster.
 *      This is e. g. used to reveal a confirmation dialog.
 *
 *   'CLUSTER_DELETE_CONFIRMED'
 *      The user has confirmed the intent to delete a cluster.
 *      This should lead to the actual API call deleting the cluster.
 *
 *   'CLUSTER_DELETE_SUCCESS'
 *      The API call to delete the cluster was successful.
 *
 *   'CLUSTER_DELETE_ERROR'
 *      The API call to delete the cluster was not successful.
 *
 * For loading resources we usually use this action name pattern:
 *
 *    '<NOUN>_LOAD'
 *    '<NOUN>_LOAD_SUCCESS'
 *    '<NOUN>_LOAD_ERROR'
 *
 * where NOUN can be either a singular or plural version of the resource name,
 * depending on which fits best.
 *
 * NOUN can also represent the nesting of resources.
 */

// Catalogs - Loading all the catalogs from the k8s api
export const CATALOGS_LOAD_REQUEST = 'CATALOGS_LOAD_REQUEST';
export const CATALOGS_LOAD_SUCCESS = 'CATALOGS_LOAD_SUCCESS';
export const CATALOGS_LOAD_ERROR = 'CATALOGS_LOAD_ERROR';

// Catalog - Loading an individual catalog's index.yaml
export const CATALOG_LOAD_INDEX_REQUEST = 'CATALOG_LOAD_INDEX_REQUEST';
export const CATALOG_LOAD_INDEX_SUCCESS = 'CATALOG_LOAD_INDEX_SUCCESS';
export const CATALOG_LOAD_INDEX_ERROR = 'CATALOG_LOAD_INDEX_ERROR';

// Cluster Select
// This action is for setting a Cluster ID in the state.
// It is used for example for keeping context when moving from the cluster detail page.
// To the  app catalog.
export const CLUSTER_SELECT = 'CLUSTER_SELECT';

// Clusters
export const CLUSTERS_LIST_REQUEST = 'CLUSTERS_LIST_REQUEST';
export const CLUSTERS_LIST_SUCCESS = 'CLUSTERS_LIST_SUCCESS';
export const CLUSTERS_LIST_ERROR = 'CLUSTERS_LIST_ERROR';

export const CLUSTERS_LIST_REFRESH_REQUEST = 'CLUSTERS_LIST_REFRESH_REQUEST';
export const CLUSTERS_LIST_REFRESH_SUCCESS = 'CLUSTERS_LIST_REFRESH_SUCCESS';
export const CLUSTERS_LIST_REFRESH_ERROR = 'CLUSTERS_LIST_REFRESH_ERROR';

export const CLUSTERS_DETAILS_REQUEST = 'CLUSTERS_DETAILS_REQUEST';
export const CLUSTERS_DETAILS_FINISHED = 'CLUSTERS_DETAILS_FINISHED';

export const CLUSTER_LOAD_DETAILS_REQUEST = 'CLUSTER_LOAD_DETAILS_REQUEST';
export const CLUSTER_LOAD_DETAILS_SUCCESS = 'CLUSTER_LOAD_DETAILS_SUCCESS';
export const CLUSTER_LOAD_DETAILS_ERROR = 'CLUSTER_LOAD_DETAILS_ERROR';
export const CLUSTER_LOAD_DETAILS_FINISHED = 'CLUSTER_LOAD_DETAILS_FINISHED';

export const CLUSTER_LOAD_STATUS_REQUEST = 'CLUSTER_LOAD_STATUS_REQUEST';
export const CLUSTER_LOAD_STATUS_SUCCESS = 'CLUSTER_LOAD_STATUS_SUCCESS';
export const CLUSTER_LOAD_STATUS_NOT_FOUND = 'CLUSTER_LOAD_STATUS_NOT_FOUND';
export const CLUSTER_LOAD_STATUS_ERROR = 'CLUSTER_LOAD_STATUS_ERROR';

export const CLUSTER_CREATE_REQUEST = 'CLUSTER_CREATE_REQUEST';
export const CLUSTER_CREATE_SUCCESS = 'CLUSTER_CREATE_SUCCESS';
export const V5_CLUSTER_CREATE_SUCCESS = 'V5_CLUSTER_CREATE_SUCCESS';
export const CLUSTER_CREATE_ERROR = 'CLUSTER_CREATE_ERROR';

export const CLUSTER_DELETE_REQUEST = 'CLUSTER_DELETE_REQUEST';
export const CLUSTER_DELETE_CONFIRMED = 'CLUSTER_DELETE_CONFIRMED';
export const CLUSTER_DELETE_SUCCESS = 'CLUSTER_DELETE_SUCCESS';
export const CLUSTER_DELETE_ERROR = 'CLUSTER_DELETE_ERROR';
export const CLUSTER_REMOVE_FROM_STORE = 'CLUSTER_REMOVE_FROM_STORE';

export const CLUSTER_PATCH = 'CLUSTER_PATCH';
export const CLUSTER_PATCH_ERROR = 'CLUSTER_PATCH_ERROR';

// Clusters - Apps
export const CLUSTER_LOAD_APP_README_REQUEST =
  'CLUSTER_LOAD_APP_README_REQUEST';
export const CLUSTER_LOAD_APP_README_SUCCESS =
  'CLUSTER_LOAD_APP_README_SUCCESS';
export const CLUSTER_LOAD_APP_README_ERROR = 'CLUSTER_LOAD_APP_README_ERROR';

// Clusters - App Configs
export const CLUSTER_CREATE_APP_CONFIG_REQUEST =
  'CLUSTER_CREATE_APP_CONFIG_REQUEST';
export const CLUSTER_CREATE_APP_CONFIG_SUCCESS =
  'CLUSTER_CREATE_APP_CONFIG_SUCCESS';
export const CLUSTER_CREATE_APP_CONFIG_ERROR =
  'CLUSTER_CREATE_APP_CONFIG_ERROR';

export const CLUSTER_UPDATE_APP_CONFIG_REQUEST =
  'CLUSTER_UPDATE_APP_CONFIG_REQUEST';
export const CLUSTER_UPDATE_APP_CONFIG_SUCCESS =
  'CLUSTER_UPDATE_APP_CONFIG_SUCCESS';
export const CLUSTER_UPDATE_APP_CONFIG_ERROR =
  'CLUSTER_UPDATE_APP_CONFIG_ERROR';

export const CLUSTER_DELETE_APP_CONFIG_REQUEST =
  'CLUSTER_DELETE_APP_CONFIG_REQUEST';
export const CLUSTER_DELETE_APP_CONFIG_SUCCESS =
  'CLUSTER_DELETE_APP_CONFIG_SUCCESS';
export const CLUSTER_DELETE_APP_CONFIG_ERROR =
  'CLUSTER_UPDATE_APP_CONFIG_ERROR';

// Clusters - App Secrets
export const CLUSTER_CREATE_APP_SECRET_REQUEST =
  'CLUSTER_CREATE_APP_SECRET_REQUEST';
export const CLUSTER_CREATE_APP_SECRET_SUCCESS =
  'CLUSTER_CREATE_APP_SECRET_SUCCESS';
export const CLUSTER_CREATE_APP_SECRET_ERROR =
  'CLUSTER_CREATE_APP_SECRET_ERROR';

export const CLUSTER_UPDATE_APP_SECRET_REQUEST =
  'CLUSTER_UPDATE_APP_SECRET_REQUEST';
export const CLUSTER_UPDATE_APP_SECRET_SUCCESS =
  'CLUSTER_UPDATE_APP_SECRET_SUCCESS';
export const CLUSTER_UPDATE_APP_SECRET_ERROR =
  'CLUSTER_UPDATE_APP_SECRET_ERROR';

export const CLUSTER_DELETE_APP_SECRET_REQUEST =
  'CLUSTER_DELETE_APP_SECRET_REQUEST';
export const CLUSTER_DELETE_APP_SECRET_SUCCESS =
  'CLUSTER_DELETE_APP_SECRET_SUCCESS';
export const CLUSTER_DELETE_APP_SECRET_ERROR =
  'CLUSTER_UPDATE_APP_SECRET_ERROR';

// Clusters - Key Pairs
export const CLUSTER_LOAD_KEY_PAIRS_REQUEST = 'CLUSTER_LOAD_KEY_PAIRS_REQUEST';
export const CLUSTER_LOAD_KEY_PAIRS_SUCCESS = 'CLUSTER_LOAD_KEY_PAIRS_SUCCESS';
export const CLUSTER_LOAD_KEY_PAIRS_ERROR = 'CLUSTER_LOAD_KEY_PAIRS_ERROR';

export const CLUSTER_CREATE_KEY_PAIR_REQUEST =
  'CLUSTER_CREATE_KEY_PAIR_REQUEST';
export const CLUSTER_CREATE_KEY_PAIR_SUCCESS =
  'CLUSTER_CREATE_KEY_PAIR_SUCCESS';
export const CLUSTER_CREATE_KEY_PAIR_ERROR = 'CLUSTER_CREATE_KEY_PAIR_ERROR';

// General Errors
export const UNAUTHORIZED = 'UNAUTHORIZED';

// Info
export const INFO_LOAD_REQUEST = 'INFO_LOAD_REQUEST';
export const INFO_LOAD_SUCCESS = 'INFO_LOAD_SUCCESS';
export const INFO_LOAD_ERROR = 'INFO_LOAD_ERROR';

// Invitations
export const INVITATION_CREATE_REQUEST = 'INVITATION_CREATE_REQUEST';
export const INVITATION_CREATE_SUCCESS = 'INVITATION_CREATE_SUCCESS';
export const INVITATION_CREATE_ERROR = 'INVITATION_CREATE_ERROR';

export const INVITATIONS_LOAD_REQUEST = 'INVITATIONS_LOAD_REQUEST';
export const INVITATIONS_LOAD_SUCCESS = 'INVITATIONS_LOAD_SUCCESS';
export const INVITATIONS_LOAD_ERROR = 'INVITATIONS_LOAD_ERROR';

// Modals
export const MODAL_HIDE = 'MODAL_HIDE';

// Organizations
export const ORGANIZATION_SELECT = 'ORGANIZATION_SELECT';

export const ORGANIZATIONS_LOAD_REQUEST = 'ORGANIZATIONS_LOAD_REQUEST';
export const ORGANIZATIONS_LOAD_SUCCESS = 'ORGANIZATIONS_LOAD_SUCCESS';
export const ORGANIZATIONS_LOAD_ERROR = 'ORGANIZATIONS_LOAD_ERROR';

export const ORGANIZATION_DELETE_REQUEST = 'ORGANIZATION_DELETE_REQUEST';
export const ORGANIZATION_DELETE_CONFIRMED = 'ORGANIZATION_DELETE_CONFIRMED';
export const ORGANIZATION_DELETE_SUCCESS = 'ORGANIZATION_DELETE_SUCCESS';
export const ORGANIZATION_DELETE_ERROR = 'ORGANIZATION_DELETE_ERROR';

export const ORGANIZATION_CREATE_REQUEST = 'ORGANIZATION_CREATE_REQUEST';
export const ORGANIZATION_CREATE_CONFIRMED = 'ORGANIZATION_CREATE_CONFIRMED';
export const ORGANIZATION_CREATE_SUCCESS = 'ORGANIZATION_CREATE_SUCCESS';
export const ORGANIZATION_CREATE_ERROR = 'ORGANIZATION_CREATE_ERROR';

export const ORGANIZATION_CREDENTIALS_LOAD_REQUEST =
  'ORGANIZATION_CREDENTIALS_LOAD_REQUEST';
export const ORGANIZATION_CREDENTIALS_LOAD_SUCCESS =
  'ORGANIZATION_CREDENTIALS_LOAD_SUCCESS';
export const ORGANIZATION_CREDENTIALS_LOAD_ERROR =
  'ORGANIZATION_CREDENTIALS_LOAD_ERROR';

// user intends to set the credentials, so reveal the form
export const ORGANIZATION_CREDENTIALS_SET = 'ORGANIZATION_CREDENTIALS_SET';

// user has submitted the form
export const ORGANIZATION_CREDENTIALS_SET_CONFIRMED_REQUEST =
  'ORGANIZATION_CREDENTIALS_SET_CONFIRMED_REQUEST';

export const ORGANIZATION_CREDENTIALS_SET_SUCCESS =
  'ORGANIZATION_CREDENTIALS_SET_SUCCESS';
export const ORGANIZATION_CREDENTIALS_SET_ERROR =
  'ORGANIZATION_CREDENTIALS_SET_ERROR';
export const ORGANIZATION_CREDENTIALS_SET_DISCARD =
  'ORGANIZATION_CREDENTIALS_SET_DISCARD';

// Organizations - Add / Remove members
export const ORGANIZATION_ADD_MEMBER_REQUEST =
  'ORGANIZATION_ADD_MEMBER_REQUEST';
export const ORGANIZATION_ADD_MEMBER_CONFIRMED =
  'ORGANIZATION_ADD_MEMBER_CONFIRMED';
export const ORGANIZATION_ADD_MEMBER_TYPING = 'ORGANIZATION_ADD_MEMBER_TYPING';
export const ORGANIZATION_ADD_MEMBER_SUCCESS =
  'ORGANIZATION_ADD_MEMBER_SUCCESS';
export const ORGANIZATION_ADD_MEMBER_ERROR = 'ORGANIZATION_ADD_MEMBER_ERROR';

export const ORGANIZATION_REMOVE_MEMBER = 'ORGANIZATION_REMOVE_MEMBER';
export const ORGANIZATION_REMOVE_MEMBER_CONFIRMED_REQUEST =
  'ORGANIZATION_REMOVE_MEMBER_CONFIRMED_REQUEST';
export const ORGANIZATION_REMOVE_MEMBER_SUCCESS =
  'ORGANIZATION_REMOVE_MEMBER_SUCCESS';
export const ORGANIZATION_REMOVE_MEMBER_ERROR =
  'ORGANIZATION_REMOVE_MEMBER_ERROR';

// Password Recovery
export const REQUEST_PASSWORD_RECOVERY_TOKEN_REQUEST =
  'REQUEST_PASSWORD_RECOVERY_TOKEN_REQUEST';
export const VERIFY_PASSWORD_RECOVERY_TOKEN = 'VERIFY_PASSWORD_RECOVERY_TOKEN';
export const SET_NEW_PASSWORD = 'SET_NEW_PASSWORD';

// User related
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_ERROR = 'LOGIN_ERROR';

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_ERROR = 'LOGOUT_ERROR';

export const REFRESH_USER_INFO_REQUEST = 'REFRESH_USER_INFO_REQUEST';
export const REFRESH_USER_INFO_SUCCESS = 'REFRESH_USER_INFO_SUCCESS';
export const REFRESH_USER_INFO_ERROR = 'REFRESH_USER_INFO_ERROR';

export const USERS_DELETE_REQUEST = 'USERS_DELETE_REQUEST';
export const USERS_DELETE_SUCCESS = 'USERS_DELETE_SUCCESS';
export const USERS_DELETE_ERROR = 'USERS_DELETE_ERROR';

export const USERS_LOAD_REQUEST = 'USERS_LOAD_REQUEST';
export const USERS_LOAD_SUCCESS = 'USERS_LOAD_SUCCESS';
export const USERS_LOAD_ERROR = 'USERS_LOAD_ERROR';

export const USERS_REMOVE_EXPIRATION_REQUEST =
  'USERS_REMOVE_EXPIRATION_REQUEST';
export const USERS_REMOVE_EXPIRATION_SUCCESS =
  'USERS_REMOVE_EXPIRATION_SUCCESS';
export const USERS_REMOVE_EXPIRATION_ERROR = 'USERS_REMOVE_EXPIRATION_ERROR';

export const ROUTER_LOCATION_CHANGE = '@@router/LOCATION_CHANGE';
