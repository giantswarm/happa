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


'use strict';

// Clusters
export const CLUSTER_SELECT = 'CLUSTER_SELECT';

export const CLUSTER_LOAD_DETAILS = 'CLUSTER_LOAD_DETAILS';
export const CLUSTER_LOAD_DETAILS_SUCCESS = 'CLUSTER_LOAD_DETAILS_SUCCESS';
export const CLUSTER_LOAD_DETAILS_ERROR = 'CLUSTER_LOAD_DETAILS_ERROR';

export const CLUSTER_LOAD_SUCCESS = 'CLUSTER_LOAD_SUCCESS';
export const CLUSTER_LOAD_ERROR = 'CLUSTER_LOAD_ERROR';

export const CLUSTER_CREATE = 'CLUSTER_CREATE';
export const CLUSTER_CREATE_SUCCESS = 'CLUSTER_CREATE_SUCCESS';
export const CLUSTER_CREATE_ERROR = 'CLUSTER_CREATE_ERROR';

export const CLUSTER_DELETE = 'CLUSTER_DELETE';
export const CLUSTER_DELETE_CONFIRMED = 'CLUSTER_DELETE_CONFIRMED';
export const CLUSTER_DELETE_SUCCESS = 'CLUSTER_DELETE_SUCCESS';
export const CLUSTER_DELETE_ERROR = 'CLUSTER_DELETE_ERROR';

export const CLUSTER_PATCH = 'CLUSTER_PATCH';
export const CLUSTER_PATCH_SUCCESS = 'CLUSTER_PATCH_SUCCESS';
export const CLUSTER_PATCH_ERROR = 'CLUSTER_PATCH_ERROR';

// Clusters - Key Pairs
export const CLUSTER_LOAD_KEY_PAIRS = 'CLUSTER_LOAD_KEY_PAIRS';
export const CLUSTER_LOAD_KEY_PAIRS_SUCCESS = 'CLUSTER_LOAD_KEY_PAIRS_SUCCESS';
export const CLUSTER_LOAD_KEY_PAIRS_ERROR = 'CLUSTER_LOAD_KEY_PAIRS_ERROR';

export const CLUSTER_CREATE_KEY_PAIR = 'CLUSTER_CREATE_KEY_PAIR';
export const CLUSTER_CREATE_KEY_PAIR_SUCCESS = 'CLUSTER_CREATE_KEY_PAIR_SUCCESS';
export const CLUSTER_CREATE_KEY_PAIR_ERROR = 'CLUSTER_CREATE_KEY_PAIR_ERROR';

// Flashes
export const FLASH_REMOVE = 'FLASH_REMOVE';
export const FLASH_ADD = 'FLASH_ADD';
export const FLASH_CLEAR_ALL = 'FLASH_CLEAR_ALL';

// General Errors
export const UNAUTHORIZED = 'UNAUTHORIZED';

// Info
export const INFO_LOAD = 'INFO_LOAD';
export const INFO_LOAD_SUCCESS = 'INFO_LOAD_SUCCESS';
export const INFO_LOAD_ERROR = 'INFO_LOAD_ERROR';

// Invitations
export const INVITATION_CREATE = 'INVITATION_CREATE';
export const INVITATION_CREATE_SUCCESS = 'INVITATION_CREATE_SUCCESS';
export const INVITATION_CREATE_ERROR = 'INVITATION_CREATE_ERROR';

export const INVITATIONS_LOAD = 'INVITATIONS_LOAD';
export const INVITATIONS_LOAD_SUCCESS = 'INVITATIONS_LOAD_SUCCESS';
export const INVITATIONS_LOAD_ERROR = 'INVITATIONS_LOAD_ERROR';

// Modals
export const MODAL_HIDE = 'MODAL_HIDE';

// Organizations
export const ORGANIZATION_SELECT = 'ORGANIZATION_SELECT';

export const ORGANIZATIONS_LOAD = 'ORGANIZATIONS_LOAD';
export const ORGANIZATIONS_LOAD_SUCCESS = 'ORGANIZATIONS_LOAD_SUCCESS';
export const ORGANIZATIONS_LOAD_ERROR = 'ORGANIZATIONS_LOAD_ERROR';

export const ORGANIZATION_DELETE = 'ORGANIZATION_DELETE';
export const ORGANIZATION_DELETE_CONFIRMED = 'ORGANIZATION_DELETE_CONFIRMED';
export const ORGANIZATION_DELETE_SUCCESS = 'ORGANIZATION_DELETE_SUCCESS';
export const ORGANIZATION_DELETE_ERROR = 'ORGANIZATION_DELETE_ERROR';

export const ORGANIZATION_CREATE = 'ORGANIZATION_CREATE';
export const ORGANIZATION_CREATE_CONFIRMED = 'ORGANIZATION_CREATE_CONFIRMED';
export const ORGANIZATION_CREATE_SUCCESS = 'ORGANIZATION_CREATE_SUCCESS';
export const ORGANIZATION_CREATE_ERROR = 'ORGANIZATION_CREATE_ERROR';

export const ORGANIZATION_CREDENTIALS_LOAD = 'ORGANIZATION_CREDENTIALS_LOAD';
export const ORGANIZATION_CREDENTIALS_LOAD_SUCCESS = 'ORGANIZATION_CREDENTIALS_LOAD_SUCCESS';
export const ORGANIZATION_CREDENTIALS_LOAD_ERROR = 'ORGANIZATION_CREDENTIALS_LOAD_ERROR';

// user intends to set the credentials, so reveal the form
export const ORGANIZATION_CREDENTIALS_SET = 'ORGANIZATION_CREDENTIALS_SET';

// user has submitted the form
export const ORGANIZATION_CREDENTIALS_SET_CONFIRMED = 'ORGANIZATION_CREDENTIALS_SET_CONFIRMED';

export const ORGANIZATION_CREDENTIALS_SET_SUCCESS = 'ORGANIZATION_CREDENTIALS_SET_SUCCESS';
export const ORGANIZATION_CREDENTIALS_SET_ERROR = 'ORGANIZATION_CREDENTIALS_SET_ERROR';

// Organizations - Add / Remove members
export const ORGANIZATION_ADD_MEMBER = 'ORGANIZATION_ADD_MEMBER';
export const ORGANIZATION_ADD_MEMBER_CONFIRMED = 'ORGANIZATION_ADD_MEMBER_CONFIRMED';
export const ORGANIZATION_ADD_MEMBER_TYPING = 'ORGANIZATION_ADD_MEMBER_TYPING';
export const ORGANIZATION_ADD_MEMBER_SUCCESS = 'ORGANIZATION_ADD_MEMBER_SUCCESS';
export const ORGANIZATION_ADD_MEMBER_ERROR = 'ORGANIZATION_ADD_MEMBER_ERROR';

export const ORGANIZATION_REMOVE_MEMBER = 'ORGANIZATION_REMOVE_MEMBER';
export const ORGANIZATION_REMOVE_MEMBER_CONFIRMED = 'ORGANIZATION_REMOVE_MEMBER_CONFIRMED';
export const ORGANIZATION_REMOVE_MEMBER_SUCCESS = 'ORGANIZATION_REMOVE_MEMBER_SUCCESS';
export const ORGANIZATION_REMOVE_MEMBER_ERROR = 'ORGANIZATION_REMOVE_MEMBER_ERROR';

// Password Recovery
export const REQUEST_PASSWORD_RECOVERY_TOKEN = 'REQUEST_PASSWORD_RECOVERY_TOKEN';
export const VERIFY_PASSWORD_RECOVERY_TOKEN = 'VERIFY_PASSWORD_RECOVERY_TOKEN';
export const SET_NEW_PASSWORD = 'SET_NEW_PASSWORD';

// User related
export const LOGIN = 'LOGIN';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_ERROR = 'LOGIN_ERROR';

export const LOGOUT = 'LOGOUT';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_ERROR = 'LOGOUT_ERROR';

export const REFRESH_USER_INFO_SUCCESS = 'REFRESH_USER_INFO_SUCCESS';
export const REFRESH_USER_INFO_ERROR = 'REFRESH_USER_INFO_ERROR';

export const USERS_DELETE = 'USERS_DELETE';
export const USERS_DELETE_SUCCESS = 'USERS_DELETE_SUCCESS';
export const USERS_DELETE_ERROR = 'USERS_DELETE_ERROR';

export const USERS_LOAD = 'USERS_LOAD';
export const USERS_LOAD_SUCCESS = 'USERS_LOAD_SUCCESS';
export const USERS_LOAD_ERROR = 'USERS_LOAD_ERROR';

export const USERS_REMOVE_EXPIRATION = 'USERS_REMOVE_EXPIRATION';
export const USERS_REMOVE_EXPIRATION_SUCCESS = 'USERS_REMOVE_EXPIRATION_SUCCESS';
export const USERS_REMOVE_EXPIRATION_ERROR = 'USERS_REMOVE_EXPIRATION_ERROR';

// Releases
export const RELEASES_LOAD = 'RELEASES_LOAD';
export const RELEASES_LOAD_SUCCESS = 'RELEASES_LOAD_SUCCESS';
export const RELEASES_LOAD_ERROR = 'RELEASES_LOAD_ERROR';
