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

// Clusters - Key Pairs
export const CLUSTER_LOAD_KEY_PAIRS_REQUEST = 'CLUSTER_LOAD_KEY_PAIRS_REQUEST';
export const CLUSTER_LOAD_KEY_PAIRS_SUCCESS = 'CLUSTER_LOAD_KEY_PAIRS_SUCCESS';
export const CLUSTER_LOAD_KEY_PAIRS_ERROR = 'CLUSTER_LOAD_KEY_PAIRS_ERROR';

export const CLUSTER_CREATE_KEY_PAIR_REQUEST =
  'CLUSTER_CREATE_KEY_PAIR_REQUEST';
export const CLUSTER_CREATE_KEY_PAIR_SUCCESS =
  'CLUSTER_CREATE_KEY_PAIR_SUCCESS';
export const CLUSTER_CREATE_KEY_PAIR_ERROR = 'CLUSTER_CREATE_KEY_PAIR_ERROR';

export const ROUTER_LOCATION_CHANGE = '@@router/LOCATION_CHANGE';
