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

// Cluster Select
// This action is for setting a Cluster ID in the state.
// It is used for example for keeping context when moving from the cluster detail page.
// To the  app catalog.
export const CLUSTER_SELECT = 'CLUSTER_SELECT';

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

export const ROUTER_LOCATION_CHANGE = '@@router/LOCATION_CHANGE';
